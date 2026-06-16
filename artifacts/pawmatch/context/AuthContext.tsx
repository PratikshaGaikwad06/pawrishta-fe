import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface Owner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  bio: string;
  verified: boolean;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  bio: string;
  photos: string[];
  vaccinated: boolean;
  neutered: boolean;
  temperament: string[];
  distance?: number;
}

interface AuthContextType {
  owner: Owner | null;
  myDog: Dog | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (owner: Partial<Owner>, dog: Partial<Dog>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  location: string;
  dogName: string;
  dogBreed: string;
  dogAge: number;
  dogGender: "male" | "female";
}

const MOCK_OWNER: Owner = {
  id: "me",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: undefined,
  location: "San Francisco, CA",
  bio: "Dog lover and outdoor enthusiast. Max loves morning runs and belly rubs.",
  verified: true,
};

const MOCK_MY_DOG: Dog = {
  id: "mydog",
  ownerId: "me",
  name: "Max",
  breed: "Golden Retriever",
  age: 3,
  gender: "male",
  weight: 32,
  bio: "Friendly and energetic! Loves to play fetch and make new friends at the park.",
  photos: [],
  vaccinated: true,
  neutered: true,
  temperament: ["Friendly", "Playful", "Gentle"],
};

const AuthContext = createContext<AuthContextType>({
  owner: null,
  myDog: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: () => {},
});

const STORAGE_KEY = "@pawmatch_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [myDog, setMyDog] = useState<Dog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { owner: o, myDog: d } = JSON.parse(stored);
          setOwner(o);
          setMyDog(d);
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (o: Owner, d: Dog) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ owner: o, myDog: d }));
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    setOwner(MOCK_OWNER);
    setMyDog(MOCK_MY_DOG);
    await persist(MOCK_OWNER, MOCK_MY_DOG);
  }, [persist]);

  const register = useCallback(async (data: RegisterData) => {
    await new Promise((r) => setTimeout(r, 1200));
    const newOwner: Owner = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      location: data.location,
      bio: "",
      verified: false,
    };
    const newDog: Dog = {
      id: Date.now().toString() + "d",
      ownerId: newOwner.id,
      name: data.dogName,
      breed: data.dogBreed,
      age: data.dogAge,
      gender: data.dogGender,
      weight: 0,
      bio: "",
      photos: [],
      vaccinated: false,
      neutered: false,
      temperament: [],
    };
    setOwner(newOwner);
    setMyDog(newDog);
    await persist(newOwner, newDog);
  }, [persist]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setOwner(null);
    setMyDog(null);
  }, []);

  const updateProfile = useCallback((ownerData: Partial<Owner>, dogData: Partial<Dog>) => {
    setOwner((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...ownerData };
      setMyDog((prevDog) => {
        if (!prevDog) return prevDog;
        const updatedDog = { ...prevDog, ...dogData };
        persist(updated, updatedDog);
        return updatedDog;
      });
      return updated;
    });
  }, [persist]);

  return (
    <AuthContext.Provider
      value={{
        owner,
        myDog,
        isLoading,
        isAuthenticated: !!owner,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
