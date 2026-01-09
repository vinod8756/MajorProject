import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const sendDummyReading = async () => {
  try {
    const docRef = await addDoc(collection(db, "readings"), {
      deviceId: "pi-test-001",
      temperature: Math.floor(30 + Math.random() * 5),
      heartRate: Math.floor(130 + Math.random() * 20),
      humidity: Math.floor(40 + Math.random() * 20),
      behavior: "sleeping",
      soundLevel: Math.floor(Math.random() * 30),
      timestamp: serverTimestamp(),
    });

    console.log("✅ Dummy reading written:", docRef.id);
  } catch (error) {
    console.error("❌ Firestore write failed:", error);
  }
};
