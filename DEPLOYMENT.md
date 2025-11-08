# Scan Master - Inspection Pro - Deployment Guide

## Overview

This guide covers deploying **Scan Master - Inspection Pro** as a standalone, self-hosted application using Docker. The application includes:

- React-based PWA frontend with offline capabilities
- Complete Supabase backend (PostgreSQL database, Auth, Storage, Realtime)
- Multi-tenant architecture for organizational isolation
- Offline-first design with automatic synchronization

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows with WSL2
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 10GB free space
- **Network**: Internet access for initial setup (can run offline after deployment)

### Software Requirements

1. **Docker** (version 20.10+)
   - Installation: https://docs.docker.com/get-docker/

2. **Docker Compose** (version 2.0+)
   - Installation: https://docs.docker.com/compose/install/

## Quick Start (Automated Setup)

The fastest way to deploy is using the automated setup script:

```bash
# Make the script executable
chmod +x scripts/setup-offline.sh

# Run the setup
./scripts/setup-offline.sh
```

This script will:
1. Check prerequisites
2. Create `.env` file with secure secrets
3. Pull Docker images
4. Build the application
5. Initialize the database
6. Start all services

After completion, access the application at:
- **Web App**: http://localhost:8080
- **Supabase Studio**: http://localhost:3000

## Manual Deployment

### Step 1: Clone or Copy Files

If deploying in an air-gapped environment, copy the entire project directory to the target machine.

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Edit .env and update the following:
nano .env
```

**Critical variables to update**:
```bash
JWT_SECRET=<your-generated-jwt-secret>
POSTGRES_PASSWORD=<your-generated-postgres-password>
SITE_URL=http://your-domain.com:8080  # Update with your actual URL
API_EXTERNAL_URL=http://your-domain.com:8000
```

### Step 3: Pull Docker Images (Online Environment)

```bash
# Pull all required images
docker-compose pull
```

**For offline deployment**, save images to tar files:
```bash
# Save images
docker save -o scan-master-images.tar \
  supabase/postgres:15.1.0.147 \
  supabase/studio:20231123-64a766a \
  kong:2.8.1 \
  supabase/gotrue:v2.99.0 \
  postgrest/postgrest:v11.2.0 \
  supabase/realtime:v2.25.35 \
  supabase/storage-api:v0.40.4 \
  supabase/postgres-meta:v0.68.0

# Transfer scan-master-images.tar to offline machine

# Load images on offline machine
docker load -i scan-master-images.tar
```

### Step 4: Build Application

```bash
# Build the application image
docker-compose build app
```

### Step 5: Initialize Database

```bash
# Start database container
docker-compose up -d supabase-db

# Wait for database to initialize
sleep 10

# Apply migrations (if needed)
# Migrations are automatically applied on first startup
```

### Step 6: Start All Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Post-Deployment Setup

### 1. Create First User

1. Navigate to http://localhost:8080
2. Click "Sign Up"
3. Enter email and password
4. Auto-confirm is enabled by default (no email verification needed)

### 2. Access Supabase Studio

1. Navigate to http://localhost:3000
2. Use the following credentials:
   - **Anon Key**: Value from `SUPABASE_ANON_KEY` in `.env`
   - **Service Role Key**: Value from `SUPABASE_SERVICE_ROLE_KEY` in `.env`

### 3. Create Default Tenant

The first user is automatically assigned to the "Default Organization" tenant.

To create additional tenants:
1. Log in as an admin user
2. Navigate to **Admin → Manage Tenants**
3. Click "Create New Tenant"
4. Enter tenant name and subdomain

## Service Architecture

### Ports

| Service | Port | Description |
|---------|------|-------------|
| Web App | 8080 | React frontend |
| Supabase Studio | 3000 | Database management UI |
| Kong API Gateway | 8000 | API proxy |
| PostgreSQL | 5432 | Database (internal) |

### Docker Volumes

| Volume | Purpose |
|--------|---------|
| `supabase-db-data` | PostgreSQL data |
| `supabase-storage-data` | File uploads |

### Data Persistence

All data is stored in Docker volumes. To backup:

```bash
# Backup database
docker exec scan-master-db pg_dump -U postgres postgres > backup.sql

# Backup volumes
docker run --rm \
  -v supabase-db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz -C /data .
```

## Networking

### Internal Network

All services communicate via the `scan-master-network` Docker bridge network.

### External Access

For production deployment:

1. **Reverse Proxy Setup** (Nginx/Apache):
   ```nginx
   server {
       listen 80;
       server_name scan-master.example.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
       }
   }
   ```

2. **SSL/TLS**: Use Let's Encrypt with Certbot:
   ```bash
   sudo certbot --nginx -d scan-master.example.com
   ```

## Multi-Tenant Configuration

### Tenant Isolation

Each tenant has:
- Isolated data in `technique_sheets`, `profiles`, `user_standard_access`
- Row-Level Security (RLS) policies enforcing data separation
- Unique subdomain (optional) or custom domain

### Creating Tenants

Via UI (Admin Panel):
```
Admin → Manage Tenants → Create New Tenant
```

Via SQL (Supabase Studio):
```sql
INSERT INTO tenants (name, subdomain, is_active)
VALUES ('Customer Org', 'customer', true);
```

## Offline Mode

### How It Works

1. **IndexedDB**: Local storage for technique sheets
2. **Service Worker**: Caches static assets and API responses
3. **Sync Manager**: Automatically syncs when connection restored

### Testing Offline Mode

1. Create a technique sheet while online
2. Disconnect from network
3. Create/edit technique sheets
4. Reconnect to network
5. Changes automatically sync to server

### Manual Sync

Click **"Sync Now"** button in the top-right corner (when online).

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart supabase-auth

# Full restart
docker-compose down && docker-compose up -d
```

### Database Connection Issues

```bash
# Check database health
docker exec scan-master-db pg_isready -U postgres

# View database logs
docker-compose logs supabase-db
```

### Authentication Failing

1. Verify `JWT_SECRET` is consistent across all services
2. Check `SITE_URL` matches your actual domain
3. Review auth logs: `docker-compose logs supabase-auth`

### Storage Not Working

```bash
# Check storage service
docker-compose logs supabase-storage

# Verify volume mounted
docker volume inspect supabase-storage-data
```

### Port Conflicts

If ports are already in use, edit `docker-compose.yml`:
```yaml
services:
  app:
    ports:
      - "8081:80"  # Change from 8080 to 8081
```

## Maintenance

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild application
docker-compose build app

# Restart services
docker-compose up -d
```

### Database Migrations

Migrations are stored in `docker/init-scripts/` and applied automatically.

To apply new migrations:
```bash
# Copy migration SQL to init-scripts directory
cp migration.sql docker/init-scripts/02-my-migration.sql

# Restart database (only for new deployments)
docker-compose restart supabase-db
```

For existing databases, run migrations manually via Supabase Studio.

### Monitoring

```bash
# View real-time logs
docker-compose logs -f

# Check resource usage
docker stats

# View service status
docker-compose ps
```

## Security Considerations

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong `JWT_SECRET` (32+ characters)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall (only expose 80/443)
- [ ] Set `DISABLE_SIGNUP=true` after creating users
- [ ] Regular backups of database and volumes
- [ ] Keep Docker images updated
- [ ] Review Supabase RLS policies

### Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct database access
sudo ufw deny 5432/tcp

# Enable firewall
sudo ufw enable
```

## Performance Tuning

### Database

Edit `docker-compose.yml` for PostgreSQL tuning:
```yaml
supabase-db:
  command:
    - postgres
    - -c
    - max_connections=200
    - -c
    - shared_buffers=256MB
    - -c
    - effective_cache_size=1GB
```

### Application

Nginx is pre-configured with:
- Gzip compression
- Static asset caching (1 year)
- PDF caching (30 days)

## Backup and Recovery

### Automated Backup Script

```bash
#!/bin/bash
BACKUP_DIR=/backups/scan-master
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec scan-master-db pg_dump -U postgres postgres | gzip > \
  ${BACKUP_DIR}/db_${DATE}.sql.gz

# Backup volumes
docker run --rm \
  -v supabase-db-data:/data \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/volumes_${DATE}.tar.gz -C /data .

# Keep only last 7 days
find ${BACKUP_DIR} -name "*.gz" -mtime +7 -delete
```

### Restore

```bash
# Restore database
gunzip < backup.sql.gz | docker exec -i scan-master-db psql -U postgres postgres

# Restore volumes
docker run --rm \
  -v supabase-db-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/volumes_backup.tar.gz -C /data
```

## Scaling

For high-traffic deployments:

1. **Horizontal Scaling**: Run multiple application instances behind a load balancer
2. **Database Replication**: Configure PostgreSQL read replicas
3. **Caching**: Add Redis for session/cache storage
4. **CDN**: Use CDN for static assets

## Support

For issues or questions:
- Review logs: `docker-compose logs -f`
- Check documentation: `README.md`
- File issue: Contact your system administrator

## License

Proprietary - See LICENSE file for details.
