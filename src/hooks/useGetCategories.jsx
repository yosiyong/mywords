
import { db, auth } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function useGetCategories() {
    const [categories, setCategories] = useState(null);

    useEffect(() => {
        async function fetchListing() {
            const q = query(collection(db, "categories"), where("update_user", "==", auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
      
            let listings = [];
            querySnapshot.forEach((doc) => {
                //console.log(doc.id, " => ", doc.data());
                return listings.push({
                        id: doc.id,
                        category: doc.data().category,
                        description: doc.data().description,
                        update_user: doc.data().update_user
                });
            });
      
            //console.log('useGetCategories:',listings);
      
            // //取得データ配列をuseStateに格納
            setCategories(listings);
        }
        fetchListing();
    }, []);

  return { categories};
}
