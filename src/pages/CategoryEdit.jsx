import { useState, useEffect } from "react";
import Spinner from "../components/Spinner";
import { toast } from "react-toastify";
import { db, auth } from "../firebase";
import { getDoc, addDoc, deleteDoc, doc, updateDoc, collection, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";

export default function CategoryEdit() {
  const navigate = useNavigate();
  //const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    description: ""
  });
  
  const {
    category,
    description
  } = formData;

  const params = useParams();
  //const inputRef = useRef();
  //const handleFocus = (event) => event.target.select();

  //編集可能なユーザーかチェック
  useEffect(() => {
    //console.log("listing", listing);
    //console.log("params", params);
    if (listing && listing.update_user !== auth.currentUser.uid) {
      toast.error("編集可能なユーザーではありません。");
      navigate("/categories-list");
    }
  }, [auth.currentUser.uid, listing, navigate]);

  //指定IDの編集対象データ取得
  useEffect(() => {
    setLoading(true);
    async function fetchListing() {
      const docRef = doc(db, "categories", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setFormData({ ...docSnap.data() });

        setLoading(false);
      } else {
        navigate("/");
        toast.error(params.listingId + ":該当する分類が存在しません。");
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
  }


  async function onUpdate() {
    //入力データ変数にDB登録するイメージ保存先URL、経度緯度、timestamp,uid情報を格納
    const formDataCopy = {
      ...formData,
      update_user: auth.currentUser.uid,
      timestamp: serverTimestamp()
    };

    //存在チェック
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
      navigate(`/categories-list`);

    }else {
      console.log('category new add');
      toast.success("該当する単語が存在しません。");
    }
  }

  async function onDelete() {
     //単語削除
     await deleteDoc(doc(db, "categories", params.listingId));

     //DB登録
     //ルートコレクションのdocument作成
     const docData = {
       ...formData,
       update_user:auth.currentUser.uid,
       timestamp: serverTimestamp()
     };
     const document = await addDoc(collection(db, "categories"), docData);
     //console.log(document.id);
     setLoading(false);
     toast.success("更新しました。");
     navigate(`/categories-list`);
  }

  function onSubmit(e) {
    //inputRef.current.focus();
    e.preventDefault();
    setLoading(true);

    //console.log('newWord:',formData.category);
    //console.log("oldword:", listing.category);

    if (formData.category === listing.category) {
      //console.log("説明のみ編集");
      onUpdate();

    }else{
      //console.log("説明編集",params.listingId);
      onDelete();
    }
  }

  if (loading) {
    return <Spinner />;
  }

return (
  <main className="max-w-2xl px-2 mx-auto">
    <div className="flex justify-center items-center mt-8 mb-2">
      <h2 className="text-2xl text-center font-semibold">分類編集</h2>
    </div>
    <form onSubmit={onSubmit}>
      
      {/* 単語 */}
      <p className="text-lg mt-6 font-semibold">単語</p>
      <input type="text" id="category" value={category} onChange={onChange} 
      className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      
      {/* 説明 */}
      <p className="text-lg mt-6 font-semibold">説明</p>
      <textarea type="text" id="description" value={description} onChange={onChange} 
        placeholder="説明" inputMode="kana" maxLength="500"
        className="w-full px-4 h-[400px] py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />

      <button type="submit" className="mt-6 mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out">
        更新</button>
    </form>
  </main>
  );
}