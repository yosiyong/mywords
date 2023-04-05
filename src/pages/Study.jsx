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
import { useNavigate } from "react-router-dom";

// Import Swiper styles
import 'swiper/css';

export default function Study() {
  //const auth = getAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedData, setSelectedData] = useState('default');
  const [inputMode, setInputMode] = useState(false);

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

        const docRef = h.ref;   //history collection data
        const parentCollectionRef = docRef.parent;  //collection reference
        const immediateParentDocumentRef = parentCollectionRef.parent;  //wordsのdocument reference
        //wordsのdocumentデータ取得して配列に格納
        parentsPromises.push(getDoc(immediateParentDocumentRef));
        historyPromises.push({id:h.id,data:h.data()});
    });

    //wordsのdocumentデータ
    const wordsSnap = await Promise.all(parentsPromises);

    let listings = [];
    wordsSnap.forEach((d) => {

      if (d.data() == null) {
        //console.log('null data word id:', d.id);
        // deleteDoc(doc(db, "words", d.id,"history", auth.currentUser.uid));
        // deleteDoc(doc(db, "words", d.id));
      }

      if (d.data() != null) {
        historyPromises.forEach((h) => {
          if (d.id == h.data.word_id) {
            const correct = h.data.correct;                  //直近学習正解フラグ
            const correct_count = h.data.correct_count;     //正解回数
            const correct_rate = h.data.correct_rate;       //正解率
            const last_studied_at = moment(h.data.last_studied_at?.toDate()); //直近学習日
            const nowday = moment();
            const diffday = nowday.diff(last_studied_at,'days');

            //通常
            if (selectedData === 'default') {
              //console.log('h.data:',h.data);
              //console.log('d.data():',d.data());
              //console.log('diffDay:',diffDay);

              //前回不正、1回目勉強後、1日過ぎている場合、2回目勉強後7日過ぎている場合、3回目勉強後、30日過ぎている場合
              if ((correct == false) || (correct_count == 1 && diffday >= 1) || (correct_count == 2 && diffday >= 7) || (correct_count == 3 && diffday >= 30) ) {
                return listings.push({
                  id: d.id,
                  word: d.data(),
                  history: h.data,
                  last_studied_at: h.data.last_studied_at.toDate()
                });
              }
            }else if(selectedData === 'rate80less') {
              //正解率80%未満
              if (correct_rate < 80) {
                //console.log('correct_rate:',correct_rate);
                return listings.push({
                  id: d.id,
                  word: d.data(),
                  history: h.data,
                  last_studied_at: h.data.last_studied_at.toDate()
                });
              }
            } else if(selectedData === 'after32days') {
              //最終学習日が31日以上
              if (diffday > 30) {
                //console.log('diffday:',diffday);
                return listings.push({
                  id: d.id,
                  word: d.data(),
                  history: h.data,
                  last_studied_at: h.data.last_studied_at.toDate()
                });
              }
            }
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
    console.log('data select')
     fetchUserListings();
  },[auth.currentUser.uid,selectedData]);

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

      //正解した回数
      const correct_count = lists[0].history.correct_count + 1;
      //勉強回数
      const study_count = lists[0].history.study_count + 1;

      //正解率計算
      let correct_rate = 0
      if (correct_count > 0) {
        correct_rate = (correct_count/study_count)*100;
        correct_rate = correct_rate.toFixed(0);
        //console.log("correct_rate:",correct_rate);
      }

      //履歴更新
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
    
    let correct_count = lists[0].history.correct_count;
    if (correct_count > 0) {
      correct_count = correct_count - 1;
    }
    
    const study_count = lists[0].history.study_count + 1;

    let correct_rate = 0
    if (correct_count > 0) {
      correct_rate = (correct_count/study_count)*100;
      correct_rate = correct_rate.toFixed(0);
      //console.log("correct_rate:",correct_rate);
    }
    
    await updateDoc(updateRef, {
      correct: false,
      correct_count: 0,
      correct_rate: correct_rate,
      study_count: study_count,
      last_studied_at: serverTimestamp()
    });

    //console.log("listings:",listings);
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

    //console.log("listing3:",listing3);
    setListings(listing3);

    // //並び替えのために再取得
    // fetchUserListings();
  }

  //編集画面へ遷移
  function onEdit(listingID) {
    //console.log(listingID);
    navigate(`/word-edit/${listingID}`);
  }

  function onSelectChange(e) {
    //console.log('seleted filter:',e.target.value);
    setSelectedData(e.target.value);
  }


  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="max-w-6xl px-3 mt-6 mx-auto">
          <>
            <div className="flex justify-center items-center mb-6">
              <h2 className="text-2xl text-center font-semibold">
                My Words
              </h2>
              <span className="ml-3 mt-3 text-sm font-semibold align-middle text-gray-400 border-b-[3px] border-b-transparent">{listings.length}単語</span>
            </div>
            <div className="flex w-full md:flex-row flex-col mx-auto sm:space-x-2 sm:space-y-0 space-y-2 sm:px-0 items-center">
              <div className="relative flex-grow w-full">
                <span className="ml-3 mt-3 text-sm font-semibold align-middle text-gray-400 border-b-[3px] border-b-transparent">抽出条件：</span>
                <select id="lang" onChange={onSelectChange} value={selectedData} className="text-sm text-gray-700 bg-white border-gray-300 rounded transition ease-in-out">
                    <option value="default">通常</option>
                    <option value="rate80less">正解率80％未満</option>
                    <option value="after32days">最終学習から31日以上経過</option>
                </select>
               </div>
               <div className="relative flex-grow w-full">
                <input id="checkInputmode" type="checkbox" value="" onChange={()=>setInputMode(!inputMode)} className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                <label htmlFor="checkInputmode" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">入力モードで学習</label>
               </div>
            </div>
            {!loading && listings.length > 0 && (
            <Swiper
              spaceBetween={50}
              slidesPerView={1}
            >
              {listings.map((listing) => (
                <SwiperSlide key={listing.id}>
                  <WordItem
                    id={listing.id}
                    listing={listing.word}
                    history={listing.history}
                    onCorrect={() => onIknow(listing.id)}
                    onInCorrect={() => onIdontknow(listing.id)} 
                    onEdit={() => onEdit(listing.id)} 
                    inputmode={inputMode}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
             )}
          </>
      </div>
    </>
  );
}
