import { useState, useRef } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { addDoc, setDoc, getDoc, doc, updateDoc, collectionGroup, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function WordSave() {
  const navigate = useNavigate();
  //const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    word: "",
    description: ""
  });
  
  const {
    word,
    description
  } = formData;

  const inputRef = useRef();
  const handleFocus = (event) => event.target.select();

  function onChange(e) {
    let boolean = null;
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }

    // Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  }

  async function onSubmit(e) {
    inputRef.current.focus();
    e.preventDefault();
    setLoading(true);

   //入力データ変数にDB登録するイメージ保存先URL、経度緯度、timestamp,uid情報を格納
    const formDataCopy = {
      ...formData,
      user: {
        correct: false,
        study_count: 0,
        correct_count: 0,
        correct_rate: 0,
        last_studied_at: serverTimestamp(),
        userRef: auth.currentUser.uid,
      },
      timestamp: serverTimestamp()
    };

    //単語存在チェック
    const wordsRef = collection(db, "words");
    const wordsQuery = query(
      wordsRef,
      where("word", "==", formDataCopy.word)
    );
    const querySnap = await getDocs(wordsQuery);
    const lastVisible = querySnap.docs.length-1;
    
    if (lastVisible > -1) {
      //単語存在
      console.log('word exist');

      //ドキュメントID取得
      let wordDocId = "";
      querySnap.forEach((doc) => {
        wordDocId = doc.id;
        //console.log(doc.id, " => ", doc.data());
      });

      //ログインユーザーの学習履歴存在チェック
      const historySnap = await getDoc(doc(db, "words", wordDocId ,"history",auth.currentUser.uid))
      if (historySnap.exists()) {
        //console.log("history Document data:", historySnap.data());
      } else {
        //ログインユーザーの学習履歴がなければ、新規作成
        console.log("No history document!");
        const subData = {
          correct: false,
          study_count: 0,
          correct_count: 0,
          correct_rate: 0,
          word_id:wordDocId,
          userRef: auth.currentUser.uid,
          last_studied_at: serverTimestamp()
        };
        const collectionPath = doc(db, "words", wordDocId, "history",auth.currentUser.uid);
        setDoc(collectionPath, subData);
      }

      // //サブコレクションhistory取得
      // const historyQuery = query(collectionGroup(db, 'history'), where('word_id', '==', wordDocId));
      // const historySnapshot = await getDocs(historyQuery);
      // console.log('historySnapshot:',historySnapshot);
      // historySnapshot.forEach((h) => {
      //     console.log(h.id, ' => ', h.data());
      // });
   
      //単語データ更新
      const updateRef = doc(db, "words", wordDocId);
      await updateDoc(updateRef, {
        word: formDataCopy.word,
        description: formDataCopy.description,
        update_user:auth.currentUser.uid
      });

      //入力クリア
      setFormData({ word: "", description: "" });
        
      setLoading(false);
      toast.success("更新しました。");
    }else {
      console.log('new add');

      //DB登録
      //ルートコレクションのdocument作成
      const docData = {
        ...formData,
        update_user:auth.currentUser.uid,
        timestamp: serverTimestamp()
      };
      const document = await addDoc(collection(db, "words"), docData);
      //console.log(document.id);

      //sub collection作成
      const subData = {
        correct: false,
        study_count: 0,
        correct_count: 0,
        correct_rate: 0,
        word_id:document.id,
        userRef: auth.currentUser.uid,
        last_studied_at: serverTimestamp()
      };
      const collectionPath = doc(db, "words", document.id, "history",auth.currentUser.uid);
      setDoc(collectionPath, subData);

      // addDoc(collection(wordsRef, document.id, 'history'), subData),

      //入力クリア
      setFormData({ word: "", description: "" });

      setLoading(false);
      toast.success("登録しました。");
    }

    //navigate(`/word-save`);
  }

  if (loading) {
    return <Spinner />;
  }

return (
  <main className="max-w-md px-2 mx-auto">
    <h1 className="text-3xl text-center mt-6 font-bold">単語登録</h1>
    <form onSubmit={onSubmit}>
      
      {/* 単語 */}
      <p className="text-lg mt-6 font-semibold">単語</p>
      <input type="text" id="word" ref={inputRef} value={word} onChange={onChange} onFocus={handleFocus}
      placeholder="単語" inputMode="latin" maxLength="100" minLength="1" required 
      className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      
      {/* 説明 */}
      <p className="text-lg mt-6 font-semibold">説明</p>
      <textarea type="text" id="description" value={description} onChange={onChange} onFocus={handleFocus}
        placeholder="説明" inputMode="kana" required maxLength="500" minLength="1" 
        className="w-full px-4 py-2 h-[200px] text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      <button type="submit" onClick={()=>inputRef.current.focus()} className="mt-6 mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
        登録</button>
    </form>
  </main>
  );
}