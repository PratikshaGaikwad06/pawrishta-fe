import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Dog } from "./AuthContext";

export type Mode = "playdate" | "breeding";

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface MatchRequest {
  id: string;
  fromOwnerId: string;
  fromDogId: string;
  toOwnerId: string;
  toDogId: string;
  mode: Mode;
  status: RequestStatus;
  createdAt: string;
  fromDog?: Dog;
  fromOwnerName?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromOwnerId: string;
  text: string;
  createdAt: string;
}

interface AppContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  nearbyDogs: Dog[];
  requests: MatchRequest[];
  chats: Record<string, ChatMessage[]>;
  sendRequest: (toDogId: string, toOwnerId: string) => void;
  respondToRequest: (requestId: string, accept: boolean) => void;
  sendMessage: (matchId: string, text: string) => void;
  getMatchedDogs: () => MatchRequest[];
  getPendingIncoming: () => MatchRequest[];
}

const DOGS_STORAGE = "@pawmatch_dogs";
const REQUESTS_STORAGE = "@pawmatch_requests";
const CHATS_STORAGE = "@pawmatch_chats";

const MOCK_DOGS: Dog[] = [
  {
    id: "d1",
    ownerId: "u1",
    name: "Luna",
    breed: "French Bulldog",
    age: 2,
    gender: "female",
    weight: 10,
    bio: "Playful and loves cuddles. Great with kids and other dogs. Looking for a playmate!",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Playful", "Affectionate", "Calm"],
    distance: 0.8,
  },
  {
    id: "d2",
    ownerId: "u2",
    name: "Rocky",
    breed: "Siberian Husky",
    age: 4,
    gender: "male",
    weight: 28,
    bio: "Energetic and loves outdoor adventures. Perfect for hiking and running partners.",
    photos: [],
    vaccinated: true,
    neutered: false,
    temperament: ["Energetic", "Adventurous", "Loyal"],
    distance: 1.4,
  },
  {
    id: "d3",
    ownerId: "u3",
    name: "Bella",
    breed: "Labrador Retriever",
    age: 1,
    gender: "female",
    weight: 22,
    bio: "Super friendly puppy looking for friends! Loves fetch and swimming.",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Friendly", "Curious", "Gentle"],
    distance: 2.1,
  },
  {
    id: "d4",
    ownerId: "u4",
    name: "Charlie",
    breed: "Golden Retriever",
    age: 5,
    gender: "male",
    weight: 34,
    bio: "The most chill dog you'll ever meet. Great for breeding with health clearances.",
    photos: [],
    vaccinated: true,
    neutered: false,
    temperament: ["Gentle", "Patient", "Obedient"],
    distance: 3.0,
  },
  {
    id: "d5",
    ownerId: "u5",
    name: "Daisy",
    breed: "Border Collie",
    age: 3,
    gender: "female",
    weight: 18,
    bio: "Super smart and agility champion. Looking for a playdate partner who can keep up!",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Intelligent", "Active", "Focused"],
    distance: 4.2,
  },
  {
    id: "d6",
    ownerId: "u6",
    name: "Zeus",
    breed: "German Shepherd",
    age: 2,
    gender: "male",
    weight: 35,
    bio: "Well-trained and protective. Certified therapy dog. Loves meeting new friends.",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Loyal", "Protective", "Calm"],
    distance: 5.0,
  },
];

const MOCK_REQUESTS: MatchRequest[] = [
  {
    id: "r1",
    fromOwnerId: "u3",
    fromDogId: "d3",
    toOwnerId: "me",
    toDogId: "mydog",
    mode: "playdate",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    fromDog: MOCK_DOGS[2],
    fromOwnerName: "Sarah M.",
  },
];

const AppContext = createContext<AppContextType>({
  mode: "playdate",
  setMode: () => {},
  nearbyDogs: [],
  requests: [],
  chats: {},
  sendRequest: () => {},
  respondToRequest: () => {},
  sendMessage: () => {},
  getMatchedDogs: () => [],
  getPendingIncoming: () => [],
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("playdate");
  const [nearbyDogs] = useState<Dog[]>(MOCK_DOGS);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(REQUESTS_STORAGE);
        if (stored) {
          setRequests(JSON.parse(stored));
        } else {
          setRequests(MOCK_REQUESTS);
        }
        const storedChats = await AsyncStorage.getItem(CHATS_STORAGE);
        if (storedChats) setChats(JSON.parse(storedChats));
      } catch {}
    })();
  }, []);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
  }, []);

  const sendRequest = useCallback((toDogId: string, toOwnerId: string) => {
    const req: MatchRequest = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      fromOwnerId: "me",
      fromDogId: "mydog",
      toOwnerId,
      toDogId,
      mode,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => {
      const updated = [...prev, req];
      AsyncStorage.setItem(REQUESTS_STORAGE, JSON.stringify(updated));
      return updated;
    });
  }, [mode]);

  const respondToRequest = useCallback((requestId: string, accept: boolean) => {
    setRequests((prev) => {
      const updated = prev.map((r) =>
        r.id === requestId
          ? { ...r, status: accept ? ("accepted" as RequestStatus) : ("rejected" as RequestStatus) }
          : r
      );
      AsyncStorage.setItem(REQUESTS_STORAGE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const sendMessage = useCallback((matchId: string, text: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      matchId,
      fromOwnerId: "me",
      text,
      createdAt: new Date().toISOString(),
    };
    setChats((prev) => {
      const updated = {
        ...prev,
        [matchId]: [...(prev[matchId] ?? []), msg],
      };
      AsyncStorage.setItem(CHATS_STORAGE, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getMatchedDogs = useCallback(() => {
    return requests.filter((r) => r.status === "accepted");
  }, [requests]);

  const getPendingIncoming = useCallback(() => {
    return requests.filter((r) => r.toOwnerId === "me" && r.status === "pending");
  }, [requests]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        nearbyDogs,
        requests,
        chats,
        sendRequest,
        respondToRequest,
        sendMessage,
        getMatchedDogs,
        getPendingIncoming,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
