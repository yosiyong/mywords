import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { addDoc, setDoc, getDoc, doc, updateDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useSetSettings } from "../context/SettingsContext";

export default function Settings() {
  const navigate = useNavigate();
  //const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const setSettingData = useSetSettings();
  const [formData, setFormData] = useState({
    category:false,
    filter: false,
    inputmode: false
  });
  
  const {
    category,
    filter,
    inputmode
  } = formData;

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      const q = query(collection(db, "settings"), where("userRef", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
          //console.log(doc.id, " => ", doc.data());
          setFormData({ ...doc.data() });
          setSettingData({ ...doc.data() });
      });

      //console.log('settings:',formData);
      setLoading(false);
    }
    fetchListing();
  }, [navigate]);

  function onChange(e) {
    //console.log(e.target.id,e.target.checked);
    // Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.checked,
      }));
    }
  }

  async function onSubmit(e) {
    //inputRef.current.focus();
    e.preventDefault();
    setLoading(true);

   //入力データ変数にDB登録するイメージ保存先URL、経度緯度、timestamp,uid情報を格納
    const formDataCopy = {
      ...formData,
      userRef: auth.currentUser.uid,
      timestamp: serverTimestamp()
    };

    //単語存在チェック
    const wordsRef = collection(db, "settings");
    const wordsQuery = query(
      wordsRef,
      where("userRef", "==", auth.currentUser.uid)
    );
    const querySnap = await getDocs(wordsQuery);
    const lastVisible = querySnap.docs.length-1;
    
    if (lastVisible > -1) {
      //単語存在
      console.log('setting data exist');

      //ドキュメントID取得
      let wordDocId = "";
      querySnap.forEach((doc) => {
        wordDocId = doc.id;
        //console.log(doc.id, " => ", doc.data());
      });
   
      //単語データ更新
      const updateRef = doc(db, "settings", wordDocId);
      await updateDoc(updateRef, {
        category: formDataCopy.category,
        filter: formDataCopy.filter,
        inputmode:formDataCopy.inputmode
      });

      setSettingData(formDataCopy);
       
      setLoading(false);
      toast.success("更新しました。");
    }else {
      console.log('setting data new add');

      //DB登録
      //ルートコレクションのdocument作成
      const docData = {
        ...formData,
        userRef:auth.currentUser.uid,
        timestamp: serverTimestamp()
      };
      const document = await addDoc(collection(db, "settings"), docData);
      //console.log(formData);
      setSettingData(formData);
      setLoading(false);
      toast.success("登録しました。");
    }

    //navigate(`/word-save`);
  }

  if (loading) {
    return <Spinner />;
  }

return (
  <main className="max-w-2xl px-2 mx-auto">

    <div className="flex justify-center items-center m-8">
      <h2 className="text-2xl text-center font-semibold">機能設定</h2>
    </div>
    
    <form onSubmit={onSubmit}>
      {/* 分類機能 */}
      <div className="p-3">
        <label htmlFor="category" className="text-lg mt-6 font-semibold">単語を分類する</label>
        <input id="category" type="checkbox" checked={category} onChange={onChange} className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
      </div>

      {/* 学習データを条件抽出 */}
      <div className="p-3">
        <label htmlFor="filter" className="text-lg mt-6 font-semibold">学習データを条件で抽出する</label>
        <input id="filter" type="checkbox" checked={filter} onChange={onChange} className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
      </div>
      
      {/* 入力モードで学習 */}
      <div className="p-3">
        <label htmlFor="inputmode" className="text-lg mt-6 font-semibold">入力モードで学習する</label>
        <input id="inputmode" type="checkbox" checked={inputmode} onChange={onChange} className="ml-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
      </div>

      <button type="submit" className="mt-6 mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
        設定</button>
    </form>
  </main>
  );
}