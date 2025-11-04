import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { signUpSchema, signInSchema } from '@/lib/validationSchemas';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [displayedText, setDisplayedText] = useState('');
  const navigate = useNavigate();
  const fullText = 'Welcome to Scan Master';
  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    const typeNextCharacter = () => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;

        // Random delay between 50-150ms for realistic typing
        // Longer delay after spaces (200-300ms)
        const isSpace = fullText[currentIndex - 1] === ' ';
        const delay = isSpace ? Math.random() * 100 + 200 : Math.random() * 100 + 50;
        timeoutId = setTimeout(typeNextCharacter, delay);
      }
    };

    // Initial delay before starting
    timeoutId = setTimeout(typeNextCharacter, 300);
    return () => clearTimeout(timeoutId);
  }, []);
  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (session) {
        navigate('/');
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = signUpSchema.safeParse({
      email,
      password,
      fullName
    });
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            full_name: validation.data.fullName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
        setFullName('');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    const validation = signInSchema.safeParse({
      email,
      password
    });
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: validation.data.email,
        password: validation.data.password
      });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please try again.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="mb-4" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-2 flex items-center justify-center whitespace-nowrap">
            <span className="inline-block">
              {displayedText.split('').map((char, index) => <motion.span key={index} initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.1
            }} className="inline-block font-extrabold">
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>)}
            </span>
            <motion.span animate={{
            opacity: [1, 0, 1]
          }} transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          }} className="inline-block w-1 h-10 md:h-12 bg-primary ml-1" style={{
            verticalAlign: 'middle'
          }} />
          </h1>
          <motion.p initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 2.5,
          duration: 0.5
        }} className="text-muted-foreground text-lg">
            Professional Ultrasonic Inspection
          </motion.p>
        </motion.div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
            <CardDescription>
              {isSignUp ? 'Create an account to save and manage your inspection technique sheets' : 'Sign in to access your inspection technique sheets'}
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {isSignUp && <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading} className={errors.fullName ? 'border-destructive' : ''} />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="inspector@example.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }} disabled={loading}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>;
}