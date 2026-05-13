import { db, auth } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs } from "firebase/firestore";

const makeBudgetDocId = async (releaseTitle) => {
  return String(releaseTitle || 'unknown')
    .trim()
    .replace(/[«»""'']/g, '')   // remove quotes/guillemets
    .replace(/[\s:,\-–—]+/g, '_') // spaces and punctuation → underscore
    .replace(/_+/g, '_')          // collapse multiple underscores
    .replace(/^_|_$/g, '')        // trim leading/trailing underscores
    .toLowerCase();
};

export const costsService = {
  async saveCosts(releaseTitle, costsData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const costsId = await makeBudgetDocId(releaseTitle);
    const costsRef = doc(db, "users", user.uid, "budgets", costsId);
    await setDoc(costsRef, { ...costsData, releaseTitle }, { merge: true });
    console.log("Costs saved for release:", releaseTitle, costsData);
  },

  async loadCosts(releaseTitle) {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const costsId = await makeBudgetDocId(releaseTitle);
    const costsRef = doc(db, "users", user.uid, "budgets", costsId);
    const snapshot = await getDoc(costsRef);

    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  },

  async loadAllCosts() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authorized");

    const costsRef = collection(db, "users", user.uid, "budgets");
    const snapshot = await getDocs(costsRef);

    const costs = {};
    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const title = data?.releaseTitle || decodeURIComponent(docSnapshot.id.replace(/_/g, '%20'));
      costs[title] = data;
    });

    console.log("Loaded all costs:", costs);
    return costs;
  }
};