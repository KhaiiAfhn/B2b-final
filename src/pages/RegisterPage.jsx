
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Briefcase, MapPin, Search, Users, Building, Mail, Loader2 } from 'lucide-react';

const industries = ["Technology", "Finance", "Healthcare", "Education", "Manufacturing", "Retail", "Real Estate", "Consulting", "Marketing", "Logistics", "Technology & IT", "Manufacturing & Industrial", "Agriculture & Agro-Tech", "Retail & Consumer Goods", "Other"];
const companySizes = ["1-10 employees", "11-50 employees", "51-200 employees", "201-500 employees", "500+ employees"];
const lookingForOptions = ["Partnership", "Investment", "Clients", "Suppliers", "Talent", "Networking", "Content Creators", "Technology Partners", "Innovation", "Startups", "Banks", "Financial Institutions", "SMEs", "Distributors", "Raw Material Suppliers", "Healthcare Sector", "International Buyers", "Industrial Clients", "Construction", "Automotive Sector", "Joint Ventures", "Sustainable Partners", "Research Institutions", "Franchisees", "Tenants", "Product Suppliers", "New Products", "Store Locations"];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const [isLoginView, setIsLoginView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const formFields = [
    { name: "companyName", label: "Company Name", type: "text", icon: <Briefcase className="w-4 h-4 text-gray-400" />, required: !isLoginView },
    { name: "email", label: "Email Address", type: "email", icon: <Mail className="w-4 h-4 text-gray-400" />, required: true },
    { name: "password", label: "Password", type: "password", icon: null, required: true },
    { name: "confirmPassword", label: "Confirm Password", type: "password", icon: null, required: !isLoginView },
    { name: "industry", label: "Industry", type: "select", options: [...new Set(industries)].sort(), icon: <Building className="w-4 h-4 text-gray-400" />, required: !isLoginView },
    { name: "location", label: "Location (e.g. City, Country)", type: "text", icon: <MapPin className="w-4 h-4 text-gray-400" />, required: !isLoginView },
    { name: "companySize", label: "Company Size", type: "select", options: companySizes, icon: <Users className="w-4 h-4 text-gray-400" />, required: !isLoginView },
    { name: "description", label: "Company Description (What you do)", type: "textarea", icon: null, required: !isLoginView },
    { name: "lookingFor", label: "Looking For (Select multiple)", type: "multiselect", options: [...new Set(lookingForOptions)].sort(), icon: <Search className="w-4 h-4 text-gray-400" />, required: !isLoginView },
    { name: "logoUrl", label: "Company Logo URL (Optional)", type: "url", icon: null, required: false },
  ];

  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    location: '',
    companySize: '',
    description: '',
    lookingFor: [],
    logoUrl: '',
  });

  const validateEmail = (email) => {
    // More stringent email validation
    if (!email) {
      setEmailError('Email is required');
      return false;
    }

    // Basic format check
    const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!basicEmailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    // Additional validation rules
    if (email.length > 254) {
      setEmailError('Email address is too long');
      return false;
    }

    const [localPart, domain] = email.split('@');

    // Check local part
    if (localPart.length > 64) {
      setEmailError('The part before @ is too long');
      return false;
    }

    // Specific character validation
    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validEmailRegex.test(email)) {
      setEmailError('Email contains invalid characters');
      return false;
    }

    // Domain specific checks
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain)) {
      setEmailError('Invalid domain format');
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      validateEmail(value);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (name, value) => {
    setFormData((prev) => {
      const currentValues = prev[name] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [name]: currentValues.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...currentValues, value] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email before submission
    if (!validateEmail(formData.email)) {
      return;
    }

    setLoading(true);
    try {
      if (isLoginView) {
        const { user } = await login(formData.email, formData.password);
        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${user.company_name || user.email}!`,
          variant: 'default',
        });
        navigate('/match');
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Error',
            description: 'Passwords do not match.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        const { user } = await register(formData);
        toast({
          title: 'Registration Successful!',
          description: `Welcome, ${user.company_name}! Your profile is created.`,
          variant: 'default',
        });
        navigate('/match');
      }
    } catch (error) {
      toast({
        title: isLoginView ? 'Login Failed' : 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-start py-8"
    >
      <Card className="w-full max-w-2xl bg-slate-800/80 border-slate-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold gradient-text">
            {isLoginView ? 'Login' : 'Join Now'}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isLoginView 
              ? 'Access your account and find your next B2B partner.' 
              : 'Create your company profile and start connecting.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {formFields.map(field => {
              if (isLoginView && !['email', 'password'].includes(field.name)) return null;
              if (!field.required && isLoginView) return null;

              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-gray-300 flex items-center">
                    {field.icon && <span className="mr-2">{field.icon}</span>}
                    {field.label}
                    {field.required && <span className="text-pink-500 ml-1">*</span>}
                  </Label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      required={field.required && !isLoginView}
                      className="bg-slate-700 border-slate-600 text-gray-200 focus:border-pink-500"
                      rows={4}
                      disabled={loading}
                    />
                  ) : field.type === 'select' ? (
                    <Select 
                      onValueChange={(value) => handleSelectChange(field.name, value)} 
                      value={formData[field.name]} 
                      required={field.required && !isLoginView}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-gray-200 focus:border-pink-500">
                        <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-gray-200">
                        {field.options.map(option => (
                          <SelectItem 
                            key={option} 
                            value={option} 
                            className="hover:bg-slate-600 focus:bg-slate-600"
                          >
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === 'multiselect' ? (
                    <div className="space-y-2 p-3 bg-slate-700 border border-slate-600 rounded-md max-h-48 overflow-y-auto">
                      {field.options.map(option => (
                        <div key={option} className="flex items-center">
                          <input 
                            type="checkbox"
                            id={`${field.name}-${option}`}
                            value={option}
                            checked={(formData[field.name] || []).includes(option)}
                            onChange={() => handleMultiSelectChange(field.name, option)}
                            className="h-4 w-4 text-pink-600 bg-slate-600 border-slate-500 rounded focus:ring-pink-500 mr-2"
                            disabled={loading}
                          />
                          <Label 
                            htmlFor={`${field.name}-${option}`} 
                            className="text-gray-300 font-normal"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name]}
                        onChange={handleChange}
                        placeholder={field.name === 'email' ? 'test@domain.com' : `Enter ${field.label.toLowerCase()}`}
                        required={field.required}
                        className={`bg-slate-700 border-slate-600 text-gray-200 focus:border-pink-500 ${
                          field.name === 'email' && emailError ? 'border-red-500' : ''
                        }`}
                        disabled={loading}
                      />
                      {field.name === 'email' && emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-3 text-lg" 
              disabled={loading || (formData.email && emailError)}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoginView ? 'Login' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button 
            variant="link" 
            onClick={() => setIsLoginView(!isLoginView)} 
            className="text-pink-400 hover:text-pink-300" 
            disabled={loading}
          >
            {isLoginView ? "Don't have an account? Register" : "Already have an account? Login"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;