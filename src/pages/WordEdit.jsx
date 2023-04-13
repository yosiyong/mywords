import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { setDoc, getDoc, addDoc, deleteDoc, doc, updateDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function WordEdit() {
  const navigate = useNavigate();
  //const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [categories, setCategories] = useState(null);
  const settingData = useSettings();
  const [formData, setFormData] = useState({
    category:"",
    word: "",
    description: ""
  });
  
  const {
    category,
    word,
    description
  } = formData;

  const params = useParams();
  const search = useLocation().search;
  const urlparam = new URLSearchParams(search);
  const frompage = urlparam.get('from');

  //const inputRef = useRef();
  //const handleFocus = (event) => event.target.select();

  //編集可能なユーザーかチェック
  useEffect(() => {
    //console.log("listing", listing);
    //console.log("params", params);
    if (listing && listing.update_user !== auth.currentUser.uid) {
      toast.error("編集可能なユーザーではありません。");
      if (frompage){
        navigate(`/${frompage}`);
      }
    }
  }, [auth.currentUser.uid, listing, navigate]);

  //指定IDの編集対象データ取得
  useEffect(() => {
    setLoading(true);

    async function fetchListing() {

      if (settingData.category) {
        const q = query(collection(db, "categories"), where("update_user", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        let categories = [];
        querySnapshot.forEach((doc) => {
            //console.log(doc.id, " => ", doc.data());
            return categories.push({
                    id: doc.id,
                    category: doc.data().category,
                    description: doc.data().description,
                    update_user: doc.data().update_user
            });
        });
        //console.log('categories:',categories);
        // //取得データ配列をuseStateに格納
        setCategories(categories);
      }

      const docRef = doc(db, "words", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data() });

        setLoading(false);
      } else {
        toast.error("該当する単語が存在しません。");
        if (frompage){
          navigate(`/${frompage}`);
        }
      }
    }

    fetchListing();
  }, [navigate, params.listingId]);

  //編集された場合
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

    //console.log('formData:',categories);
  }

  //更新処理
  async function onUpdate() {
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
    //console.log(querySnap.docs);
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
        await setDoc(collectionPath, subData);
      }
  
      //単語データ更新
      const updateRef = doc(db, "words", wordDocId);
      if (formDataCopy.category) {
        await updateDoc(updateRef, {
          category:formDataCopy.category,
          word: formDataCopy.word,
          description: formDataCopy.description,
          update_user:auth.currentUser.uid
        });
      }else{
        await updateDoc(updateRef, {
          word: formDataCopy.word,
          description: formDataCopy.description,
          update_user:auth.currentUser.uid
        });
      }

      //入力クリア
      setFormData({ word: "", description: "" });
        
      setLoading(false);
      toast.success("更新しました。");
      if (frompage){
        navigate(`/${frompage}`);
      }

    }else {
      console.log('new add');
      toast.success("該当する単語が存在しません。");
    }
  }

  //削除処理
  async function onDelete() {
     //履歴削除
     await deleteDoc(doc(db, "words", params.listingId,"history", auth.currentUser.uid));
     //単語削除
     await deleteDoc(doc(db, "words", params.listingId));

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
     await setDoc(collectionPath, subData);

     setLoading(false);
     toast.success("更新しました。");
    
    if (frompage){
      navigate(`/${frompage}`);
    }
  }

  function onSubmit(e) {
    //inputRef.current.focus();
    e.preventDefault();
    setLoading(true);

    //console.log('newWord:',formData.word);
    //console.log("oldword:", listing.word);

    if (formData.word === listing.word) {
      console.log("説明のみ編集");
      onUpdate();

    }else{
      console.log("説明編集",params.listingId);
      onDelete();
    }
  }

  if (loading) {
    return <Spinner />;
  }

return (
  <main className="max-w-2xl px-2 mx-auto">
    <div className="flex justify-center items-center mt-8 mb-2">
      <h2 className="text-2xl text-center font-semibold">単語編集</h2>
    </div>
    <form onSubmit={onSubmit}>

      {/* 分類 */}
      {!loading && settingData.category && (
        <>
        <p className="text-lg mt-6 font-semibold">分類</p>
        <select id="category" onChange={onChange} value={category} className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" >
          <option value="">分類を選択</option>
          {categories.map((item,idx) => (
            <option value={item.category} key={item.id}>{item.category}</option>
          ))}
        </select>
        </>
      )}
      
      {/* 単語 */}
      <p className="text-lg mt-6 font-semibold">単語</p>
      <input type="text" id="word" value={word} onChange={onChange} 
      className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      
      {/* 説明 */}
      <p className="text-lg mt-6 font-semibold">説明</p>
      <textarea type="text" id="description" value={description} onChange={onChange} 
        placeholder="説明" inputMode="kana" required maxLength="500" minLength="1" 
        className="w-full px-4 h-[400px] py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      <button type="submit" className="mt-6 mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
        更新</button>
    </form>
  </main>
  );
}