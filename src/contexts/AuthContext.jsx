
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session fetch error:", error);
          setCurrentUser(null);
          setLoadingAuth(false);
          return;
        }

        if (!session?.user) {
          setCurrentUser(null);
          setLoadingAuth(false);
          return;
        }

        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', profileError);
            setCurrentUser(session.user);
          } else {
            setCurrentUser(userProfile ? { ...session.user, ...userProfile } : session.user);
          }
        } catch (profileError) {
          console.error("Profile fetch error:", profileError);
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error("Session fetch error:", error);
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      
      try {
        if (!session?.user) {
          setCurrentUser(null);
          return;
        }

        try {
          const { data: userProfile, error: profileError } = await supabase
            .from('company_profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching user profile on auth change:', profileError);
            setCurrentUser(session.user);
          } else {
            setCurrentUser(userProfile ? { ...session.user, ...userProfile } : session.user);
          }
        } catch (profileError) {
          console.error("Profile fetch error on auth change:", profileError);
          setCurrentUser(session.user);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setCurrentUser(null);
      }
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    console.log("Login attempt for:", email);
    setLoadingAuth(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        throw error;
      }

      if (!data?.user) {
        console.error("No user data returned from login");
        throw new Error("Login failed - no user data returned");
      }

      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile after login:', profileError);
          setCurrentUser(data.user);
          return { user: data.user, session: data.session };
        }

        const finalUser = userProfile ? { ...data.user, ...userProfile } : data.user;
        setCurrentUser(finalUser);
        return { user: finalUser, session: data.session };
      } catch (profileError) {
        console.error("Profile fetch error during login:", profileError);
        setCurrentUser(data.user);
        return { user: data.user, session: data.session };
      }
    } catch (error) {
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const register = async (userData) => {
    console.log("Registration attempt for:", userData.email);
    setLoadingAuth(true);

    try {
      const { companyName, email, password, industry, location, companySize, description, lookingFor, logoUrl } = userData;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Registration auth error:", authError);
        throw authError;
      }

      if (!authData?.user) {
        console.error("No user created during registration");
        throw new Error("Registration failed - no user created");
      }

      const profileData = {
        auth_user_id: authData.user.id,
        company_name: companyName,
        email: email,
        industry,
        location,
        company_size: companySize,
        description,
        looking_for: lookingFor,
        logo_url: logoUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const { data: newProfile, error: profileError } = await supabase
        .from('company_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw profileError;
      }
      
      const finalUser = { ...authData.user, ...newProfile };
      setCurrentUser(finalUser);
      return { user: finalUser, session: authData.session };
    } catch (error) {
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = async () => {
    console.log("Logout attempt");
    setLoadingAuth(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      setCurrentUser(null);
    } catch (error) {
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  const updateUser = async (updatedData) => {
    if (!currentUser?.auth_user_id) {
      throw new Error("No current user or auth_user_id to update.");
    }
    
    console.log("Profile update attempt for:", currentUser.auth_user_id);
    setLoadingAuth(true);

    try {
      const profileUpdates = {
        ...updatedData,
        updated_at: new Date().toISOString()
      };
      delete profileUpdates.id;
      delete profileUpdates.auth_user_id;
      delete profileUpdates.created_at;

      const { data: updatedProfile, error } = await supabase
        .from('company_profiles')
        .update(profileUpdates)
        .eq('auth_user_id', currentUser.auth_user_id)
        .select()
        .single();

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }
      
      setCurrentUser(prevUser => ({ ...prevUser, ...updatedProfile }));
      return updatedProfile;
    } catch (error) {
      throw error;
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
