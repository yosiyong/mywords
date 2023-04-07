import { useState, useRef } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { addDoc, doc, updateDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function WordCategory() {
  const navigate = useNavigate();
  //const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: ""
  });
  
  const {
    category,
    description
  } = formData;

  const inputRef = useRef();
  //const handleFocus = (event) => event.target.select();

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
    //inputRef.current.focus();
    e.preventDefault();
    setLoading(true);

   //入力データ変数にDB登録するイメージ保存先URL、経度緯度、timestamp,uid情報を格納
    const formDataCopy = {
      ...formData,
      update_user: auth.currentUser.uid,
      timestamp: serverTimestamp()
    };

    //分類存在チェック
    const categoriesRef = collection(db, "categories");
    const categoriesQuery = query(
      categoriesRef,
      where("category", "==", formDataCopy.category)
    );
    const querySnap = await getDocs(categoriesQuery);
    const lastVisible = querySnap.docs.length-1;
    
    if (lastVisible > -1) {
      //単語存在
      console.log('category exist');

      //ドキュメントID取得
      let categoryDocId = "";
      querySnap.forEach((doc) => {
        categoryDocId = doc.id;
        //console.log(doc.id, " => ", doc.data());
      });
  
      //単語データ更新
      const updateRef = doc(db, "categories", categoryDocId);
      await updateDoc(updateRef, {
        category: formDataCopy.category,
        description: formDataCopy.description,
        update_user:auth.currentUser.uid
      });

      //入力クリア
      setFormData({ category: "", description: "" });
        
      setLoading(false);
      toast.success("更新しました。");
    }else {
      console.log('category new add');

      //DB登録
      //ルートコレクションのdocument作成
      const docData = {
        ...formData,
        update_user:auth.currentUser.uid,
        timestamp: serverTimestamp()
      };
      const document = await addDoc(collection(db, "categories"), docData);
      //console.log(document.id);
      //入力クリア
      setFormData({ category: "", description: "" });

      setLoading(false);
      toast.success("登録しました。");
    }

  }

  if (loading) {
    return <Spinner />;
  }

return (
  <main className="max-w-2xl px-2 mx-auto">
    <div className="flex justify-center items-center mt-8 mb-2">
      <h2 className="text-2xl text-center font-semibold">分類登録</h2>
    </div>
    <form onSubmit={onSubmit}>
      
      {/* 単語 */}
      <p className="text-lg mt-6 font-semibold">分類名</p>
      <input type="text" id="category" ref={inputRef} value={category} onChange={onChange} 
      placeholder="分類名" inputMode="latin" maxLength="100" minLength="1" required 
      className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      
      {/* 説明 */}
      <p className="text-lg mt-6 font-semibold">説明</p>
      <textarea type="text" id="description" value={description} onChange={onChange} 
        placeholder="説明" inputMode="kana" maxLength="500" 
        className="w-full px-4 py-2 h-[400px] text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      <button type="submit" className="mt-6 mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
        登録</button>
    </form>
  </main>
  );
}