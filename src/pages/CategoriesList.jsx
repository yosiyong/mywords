import {
    collection,
    doc,
    getDocs,
    query,
    deleteDoc,
    where,
  } from "firebase/firestore";
  import { useState, useEffect, useRef } from "react";
  import { useNavigate } from "react-router-dom";
  import { db, auth } from "../firebase";
  import { FcEditImage } from "react-icons/fc";
  import { RiDeleteBinLine } from "react-icons/ri";
  import { toast } from "react-toastify";
  import Spinner from "../components/Spinner";
  
  export default function CategoriesList() {
    //const auth = getAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("");

    const inputRef = useRef();
    const handleFocus = (event) => event.target.select();
  
    function onChange(e) {
        setCategory(e.target.value);
    }
  
    //分類データ取得
    async function fetchUserListings() {

        setLoading(true);

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
  
    async function onDelete(listingID) {
      if (window.confirm("削除してもよろしいですか。")) {

        //単語削除
        await deleteDoc(doc(db, "categories", listingID));
       
        const updatedListings = listings.filter(
          (listing) => listing.id !== listingID
        );
        setListings(updatedListings);
        toast.success("該当する分類を削除しました。");
        //toast.success(`${listingID}:${blogData.correct_count}`);
      }
    }

    function onEdit(listingID) {
        navigate(`/category-edit/${listingID}`);
    }

    function onSearch(e) {
        e.preventDefault();
        //console.log("category:", category);
        if (category != "") {
            const lists = listings.filter((item) => {
                return category == item.category;
            })
            //console.log("search:", lists.length);
            if (lists.length == 0) {
                toast.success("該当する単語が存在しません。");
                setListings(listings);
            } else {
                setListings(lists);
            }

        } else {
            fetchUserListings();
        }
    }
  
    if (loading) {
        return <Spinner />;
    }
    
    return (
      <>
        <div className="max-w-6xl px-3 mt-6 mx-auto">

              <div className="container max-w-7xl mx-auto mt-8">
                <div className="mb-2">
                    <h2 className="text-2xl text-center font-semibold">分類一覧</h2>
                </div>

                {!loading && listings.length > 0 && (
           
                    <>
                    <div className="container px-1 py-8 flex flex-wrap mx-auto items-center">
                        <div className="flex md:flex-nowrap flex-wrap justify-center items-end md:justify-start">
                            <div className="relative sm:w-64 w-40 sm:mr-4 mr-2">
                            <input type="text" id="category" ref={inputRef} value={category} onChange={onChange} onFocus={handleFocus} maxLength="32" minLength="2" placeholder="検索する単語" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:ring-2 focus:bg-transparent focus:ring-indigo-200 focus:border-indigo-500 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                            </div>
                            <button onClick={onSearch} className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded">検索</button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                        <div className="inline-block min-w-full overflow-hidden align-middle border-b border-gray-200 shadow sm:rounded-lg">
                            <table className="min-w-full">
                            <thead>
                                <tr>
                                <th
                                    className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    No.</th>
                                <th
                                    className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    単語</th>
                                <th
                                    className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                    説明</th>

                                <th className="px-5 py-3 text-sm text-left text-gray-500 border-b border-gray-200 bg-gray-50" colSpan="2">
                                    Action</th>
                                </tr>
                            </thead>

                            <tbody className="bg-white">
                                {listings.map((listing,idx) => (
                                    <tr key={listing.id}>
                                        <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                            <div className="flex items-center">
                                            {idx}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                            <div className="text-sm leading-5 text-gray-900">{listing.category}</div>
                                        </td>

                                        <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                            <p>{listing.description}</p>
                                        </td>

                                        <td className="text-sm font-medium leading-5 text-center whitespace-no-wrap border-b border-gray-200 cursor-pointer">
                                            <FcEditImage onClick={() => onEdit(listing.id)}/>
                                        </td>
                                        <td className="text-sm font-medium leading-5 whitespace-no-wrap border-b text-red-500 cursor-pointer">
                                            <RiDeleteBinLine onClick={() => onDelete(listing.id)} />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                    </>
                )}
                </div>
        </div>
      </>
    );
  }
  