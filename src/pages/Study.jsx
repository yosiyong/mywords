import {
  collectionGroup,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import WordItem from "../components/WordItem";
import moment from "moment";
import Spinner from "../components/Spinner";
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

export default function Study() {
  //const auth = getAuth();
  //const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);

  //単語データ取得
  async function fetchUserListings() {

    setLoading(true);
      
    //ログインユーザーの勉強履歴データhistory(sub collection)を取得
    const historyQuery = query(collectionGroup(db, 'history'), where('userRef', '==', auth.currentUser.uid));
    const historySnapshot = await getDocs(historyQuery);
    
    const parentsPromises = [];
    const historyPromises = [];
    
    historySnapshot.forEach((h) => {
      //console.log(h.id, ' => ', h.data());

      const correct = h.data().correct;
      const correct_count = h.data().correct_count;
      const correct_rate = h.data().correct_rate;
      const last_studied_at = moment(h.data().last_studied_at?.toDate());
      const nowday = moment();

      const diffday = nowday.diff(last_studied_at,'days');
      //console.log(diffDay);

      //前回不正、1回目勉強後、1日過ぎている場合、2回目勉強後7日過ぎている場合、3回目勉強後、30日過ぎている場合
      if ((correct == false) || (correct_count == 1 && diffday >= 1) || (correct_count == 2 && diffday >= 7) || (correct_count == 3 && diffday >= 30) ) {
        const docRef = h.ref;   //history collection data
        const parentCollectionRef = docRef.parent;  //collection reference
        const immediateParentDocumentRef = parentCollectionRef.parent;  //wordsのdocument reference
        //wordsのdocumentデータ取得して配列に格納
        parentsPromises.push(getDoc(immediateParentDocumentRef));
        historyPromises.push({id:h.id,data:h.data()});
      }
      // }else if (correct_rate <= 70) {
      //   console.log('正解率');
      //   //上記のデータが存在しなければ、正解率５０以下データ取得
      //   const docRef = h.ref;   //history collection data
      //   const parentCollectionRef = docRef.parent;  //collection reference
      //   const immediateParentDocumentRef = parentCollectionRef.parent;  //wordsのdocument reference
      //   //wordsのdocumentデータ取得して配列に格納
      //   parentsPromises.push(getDoc(immediateParentDocumentRef));
      //   historyPromises.push({id:h.id,data:h.data()});
      // }
    });

    //wordsのdocumentデータ
    const wordsSnap = await Promise.all(parentsPromises);

    let listings = [];
    wordsSnap.forEach((d) => {

      if (d.data() == null) {
        console.log('null data word id:', d.id);
        // deleteDoc(doc(db, "words", d.id,"history", auth.currentUser.uid));
        // deleteDoc(doc(db, "words", d.id));
      }

      if (d.data() != null) {
        historyPromises.forEach((h) => {
          if (d.id == h.data.word_id) {
            return listings.push({
              id: d.id,
              word: d.data(),
              history: h.data,
              last_studied_at: h.data.last_studied_at.toDate()
            });
          }
        });
      }
    });

    listings.sort(function(a, b) {
      return (a.last_studied_at < b.last_studied_at) ? -1 : 1;  //オブジェクトの昇順ソート
    });
    //console.log('listings:',listings);

    // //取得データ配列をuseStateに格納
    setListings(listings);
    setLoading(false);
  }

  //auth.currentUser.uidが変更された場合、実施
  useEffect(()=>{
    //Listingsデータ取得
     fetchUserListings();
  },[auth.currentUser.uid]);

  async function onIknow(listingID) {
    // if (window.confirm("Are you sure you want to delete?")) {
      
    //配列から指定単語の学習履歴データ取得
      let lists = listings.filter((item) => {
         return item.id == listingID;
      })
      //console.log(lists[0].history.correct_count);

      // const history = await getDoc(doc(db, "words", listingID ,"history",auth.currentUser.uid))
      // const historyData = history.data()

      //console.log(listings);
      
      //学習履歴更新
      const updateRef = doc(db, "words", listingID ,"history",auth.currentUser.uid);
      const correct_count = lists[0].history.correct_count + 1;
      const study_count = lists[0].history.study_count + 1;
      const correct_rate = (correct_count/study_count)*100;
      await updateDoc(updateRef, {
        correct: true,
        correct_count: correct_count,
        correct_rate: correct_rate,
        study_count: study_count,
        last_studied_at: serverTimestamp()
      });

      const updatedListings = listings.filter(
        (listing) => listing.id !== listingID
      );
      setListings(updatedListings);
      //toast.success(`${listingID}:${blogData.correct_count}`);
    // }
  }

  async function onIdontknow(listingID) {
    //配列から指定単語の学習履歴データ取得
    let lists = listings.filter((item) => {
      return item.id == listingID;
    })
    
    //学習履歴更新
    const updateRef = doc(db, "words", listingID ,"history",auth.currentUser.uid);
    const correct_count = lists[0].history.correct_count - 1;
    const study_count = lists[0].history.study_count + 1;
    const correct_rate = (correct_count/study_count)*100;
    
    await updateDoc(updateRef, {
      correct: false,
      correct_count: 0,
      correct_rate: correct_rate,
      study_count: study_count,
      last_studied_at: serverTimestamp()
    });

    console.log("listings:",listings);
    let now = new Date();
    const listing2 =listings.map((list, idx) => {
      if (list.id == listingID) {
        list.history.correct = false;
        list.history.correct_count = 0;
        list.history.correct_rate = correct_rate;
        list.history.study_count = study_count;
        list.history.last_studied_at = serverTimestamp();
        list.last_studied_at = now;
      }
      return list;
    });

    const listing3 = listing2.sort((a, b) => {
      return (a.last_studied_at < b.last_studied_at) ? -1 : 1;  //オブジェクトの昇順ソート
    });

    console.log("listing3:",listing3);
    setListings(listing3);

    // //並び替えのために再取得
    // fetchUserListings();
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
        {!loading && listings.length > 0 && (
          <>
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-2xl text-center font-semibold">
                My Words
              </h2>
              <span className="ml-3 mt-3 text-sm font-semibold align-middle text-gray-400 border-b-[3px] border-b-transparent">{listings.length}単語</span>
            </div>
            <Swiper
              spaceBetween={50}
              slidesPerView={1}
              onSlideChange={() => console.log('slide change')}
              onSwiper={(swiper) => console.log(swiper)}
            >
              {listings.map((listing) => (
                <SwiperSlide key={listing.id}>
                  <WordItem
                    id={listing.id}
                    listing={listing.word}
                    history={listing.history}
                    onCorrect={() => onIknow(listing.id)}
                    onInCorrect={() => onIdontknow(listing.id)}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </>
          )}
      
      </div>
    </>
  );
}
