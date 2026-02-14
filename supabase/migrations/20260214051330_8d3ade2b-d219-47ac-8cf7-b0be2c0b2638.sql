
-- Role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'admin');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  hospital TEXT DEFAULT '',
  specialty TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '',
  transcript TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'transcribed', 'completed')),
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOAP notes table
CREATE TABLE public.soap_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES public.consultations(id) ON DELETE CASCADE,
  subjective TEXT DEFAULT '',
  objective TEXT DEFAULT '',
  assessment TEXT DEFAULT '',
  plan TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Structured data table
CREATE TABLE public.structured_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES public.consultations(id) ON DELETE CASCADE,
  symptoms JSONB DEFAULT '[]'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  vitals JSONB DEFAULT '{}'::jsonb,
  diagnoses JSONB DEFAULT '[]'::jsonb,
  icd_codes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_soap_notes_updated_at BEFORE UPDATE ON public.soap_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_structured_data_updated_at BEFORE UPDATE ON public.structured_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Auto-assign role from metadata, default to 'doctor'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'doctor'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_doctor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'doctor')
$$;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_data ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- USER_ROLES policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "System inserts roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- PATIENTS policies
CREATE POLICY "Doctors see own patients" ON public.patients FOR SELECT TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Doctors create patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors update own patients" ON public.patients FOR UPDATE TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Doctors delete own patients" ON public.patients FOR DELETE TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));

-- CONSULTATIONS policies
CREATE POLICY "Doctors see own consultations" ON public.consultations FOR SELECT TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Doctors create consultations" ON public.consultations FOR INSERT TO authenticated WITH CHECK (doctor_id = auth.uid());
CREATE POLICY "Doctors update own consultations" ON public.consultations FOR UPDATE TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "Doctors delete own consultations" ON public.consultations FOR DELETE TO authenticated USING (doctor_id = auth.uid() OR public.is_admin(auth.uid()));

-- SOAP_NOTES policies (access via consultation ownership)
CREATE POLICY "Access soap notes via consultation" ON public.soap_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Create soap notes for own consultation" ON public.soap_notes FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND doctor_id = auth.uid()));
CREATE POLICY "Update soap notes for own consultation" ON public.soap_notes FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Delete soap notes for own consultation" ON public.soap_notes FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));

-- STRUCTURED_DATA policies (access via consultation ownership)
CREATE POLICY "Access structured data via consultation" ON public.structured_data FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Create structured data for own consultation" ON public.structured_data FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND doctor_id = auth.uid()));
CREATE POLICY "Update structured data for own consultation" ON public.structured_data FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "Delete structured data for own consultation" ON public.structured_data FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.consultations WHERE id = consultation_id AND (doctor_id = auth.uid() OR public.is_admin(auth.uid()))));

-- Indexes for performance
CREATE INDEX idx_patients_doctor_id ON public.patients(doctor_id);
CREATE INDEX idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_soap_notes_consultation_id ON public.soap_notes(consultation_id);
CREATE INDEX idx_structured_data_consultation_id ON public.structured_data(consultation_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
