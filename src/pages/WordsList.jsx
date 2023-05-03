import {
    collectionGroup,
    doc,
    updateDoc,
    getDoc,
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
  import { useSettings } from "../context/SettingsContext";
  import useGetCategories  from "../hooks/useGetCategories";
  
  export default function WordsList() {
    //const auth = getAuth();
    const navigate = useNavigate();
    const [allData, setAllData] = useState(null);
    const [listings, setListings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [word, setWord] = useState("");
    const [category, setCategory] = useState("");
    const [checkedList, setCheckedList] = useState([]);
    const settingData = useSettings();
    const {categories} = useGetCategories();
    const inputRef = useRef();
    const handleFocus = (event) => event.target.select();


    //*--*検索キーワードイベント
    function onKeywordChange(e) {
        setWord(e.target.value);
    }

    //*--*分類選択イベント
    function onCategoryChange(e) {
        setCategory(e.target.value);
    }

    //*--*チェックボックス全選択解除イベント
    function onAllCheckChange(e) {

        let checkboxes = [];
        document.querySelectorAll("input[type='checkbox']").forEach(el => {
            if (e.target.id != el.id) {
                el.checked = e.target.checked;
                checkboxes.push(el.id);
                //console.log("onAllCheckChange checkboxes:", checkboxes);
            }
        });

        //console.log("onAllCheckChange checkboxes:", checkboxes);
        setCheckedList([]);
        setCheckedList([...checkboxes])
        //console.log("onAllCheckChange checkedList:", checkedList);
    }

    //*--*選択チェックイベント
    function onSelected(e) {
        //console.log('onchange:',e.target.checked);
        if (e.target.checked) {
            //チェックIDを追加
            setCheckedList([...checkedList, e.target.id])
        }else{
            //IDを削除
            setCheckedList(checkedList.filter((fruit, index) => (fruit !== e.target.id)))
        }
    }
  
    //*--*単語データ取得
    async function fetchUserListings() {

        setLoading(true);
      //ログインユーザーの勉強履歴データhistory(sub collection)を取得
      const historyQuery = query(collectionGroup(db, 'history'), where('userRef', '==', auth.currentUser.uid));
      const historySnapshot = await getDocs(historyQuery);
      
      const parentsPromises = [];
      const historyPromises = [];
      
      historySnapshot.forEach((h) => {
  
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
        //console.log(d.id, ' => ', d.data());
        if (d.data() == null) {
            console.log(d.id,"null");
            // deleteDoc(doc(db, "words", d.id,"history", auth.currentUser.uid));
            // deleteDoc(doc(db, "words", d.id));
        }

        if (d.data() != null) {
            
            historyPromises.forEach((h) => {
                if (d.id == h.data.word_id) {
                //console.log(d.id, ' => ', h.data);
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
      setAllData(listings); //filter処理用に全てデータを保持
      setLoading(false);
    }
  
    //*--*auth.currentUser.uidが変更された場合、実施
    useEffect(()=>{
       
      //Listingsデータ取得
       fetchUserListings();
       
    },[auth.currentUser.uid]);
  
    //*--*削除ボタンイベント
    async function onDelete(listingID) {
      if (window.confirm("削除してもよろしいですか。")) {
        
        //履歴削除
        await deleteDoc(doc(db, "words", listingID,"history", auth.currentUser.uid));
        //単語削除
        await deleteDoc(doc(db, "words", listingID));
       
        const updatedListings = listings.filter(
          (listing) => listing.id !== listingID
        );
        setListings(updatedListings);
        //toast.success(`${listingID}:${blogData.correct_count}`);
      }
    }

    //*--*編集ボタンイベント
    function onEdit(listingID) {
        navigate(`/word-edit/${listingID}?from=words-list`);
    }

    //*--*検索ボタンイベント
    function onSearch(e) {
        e.preventDefault();

        //console.log("word:", word);
        if (word != "") {
            const lists = allData.filter((item) => {
                return item.word.word.includes(word) || item.word.description.includes(word);
            })
            //console.log("search:", lists.length);
            if (lists.length == 0) {
                toast.success("該当する単語が存在しません。");
                setListings(allData);
            } else {
                setListings(lists);
            }
        }else{
            fetchUserListings();
        }

    }

    //*--*「分類で検索」ボタンイベント
    function onCategorySearch(e) {
        e.preventDefault();
        //console.log("onCategorySearch category:", category);
        //console.log("onCategorySearch AllData:", allData);
       if (category != "") {
        
            const lists = allData.filter((item) => {
                return category == item.word.category;
            })
            //console.log("onCategorySearch:", lists.length);
            if (lists.length == 0) {
                toast.success("該当する分類が存在しません。");
                setListings(allData);
            } else {
                setListings(lists);
            }
        }else{
            fetchUserListings();
        }
 
    }

    //*--*「分類する」ボタンイベント
    async function onCategory(e) {
        e.preventDefault();
        //console.log("onCategory selected checkedList:", checkedList);
        //if (category) {
            if (checkedList.length > 0) {
                setLoading(true);
                //console.log('checkedList:',checkedList);
                await Promise.all(checkedList.map(async (item)=>{
                    const updateRef = doc(db, "words", item);
                    await updateDoc(updateRef, {
                      category:category
                    });
                }));

                fetchUserListings();
                setCheckedList([]);
                setLoading(false);
                toast.success("分類登録しました。");
            }
        //}
    }
  
    //*--*ローディン
    if (loading) {
        return <Spinner />;
    }
    
    //*--*出力
    return (
      <>
        <div className="max-w-6xl px-3 mt-6 mx-auto">
          {!loading && listings.length > 0 && (
            <>

              <div className="container max-w-7xl mx-auto mt-8">
                <div className="mb-2">
                    <h2 className="text-2xl text-center font-semibold">My Words</h2>
                </div>
           
                <div className="container m-8 mx-auto">
                    <div className="flex lg:w-full w-full sm:flex-row flex-col mx-auto px-4 sm:space-x-4 sm:space-y-0 space-y-4 sm:px-0 items-center">
     
                        <div className="relative flex-grow">
                            <input type="text" id="word" ref={inputRef} value={word} onChange={onKeywordChange} onFocus={handleFocus} maxLength="32" minLength="2" placeholder="検索する単語" className="w-1/2 bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"/>
                            <button onClick={onSearch} className="text-white ml-5 w-[100px] bg-indigo-500 border-0 p-2 focus:outline-none hover:bg-indigo-600 rounded text-md">検索</button>
                        </div>
                        {settingData.category && categories && (
                            <>
                            <div className="relative flex-grow">
                                <select id="category" onChange={onCategoryChange} value={category} className="w-full first-line:bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" >
                                        <option value="">分類を選択</option>
                                        {categories.map((listing,idx) => (
                                        <option value={listing.category} key={listing.id}>{listing.category}</option>
                                        ))}
                                </select>
                            </div>
                            <button onClick={onCategorySearch} className="text-white w-[150px] bg-indigo-500 border-0 p-2 focus:outline-none hover:bg-indigo-600 rounded text-md">分類で検索</button>
                            <button onClick={onCategory} className="text-white w-[150px] bg-red-500 border-0 p-2 focus:outline-none hover:bg-red-600 rounded text-md">分類する</button>
                            </>
                        )}
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
                            {settingData.category && (
                            <th
                                className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                <input id="chkAllcheck" type="checkbox" onChange={onAllCheckChange} /></th>
                            )}

                            {settingData.category && (
                            <th
                                className="px-5 py-3 text-xs font-medium leading-4 tracking-wider text-left text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                                分類</th>
                            )}
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
                                    {settingData.category && (
                                    <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <input id={listing.id} type="checkbox" onChange={onSelected} />
                                    </td>
                                    )}
                                    {settingData.category && (
                                    <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">{listing.word.category}</div>
                                    </td>
                                    )}

                                    <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <div className="text-sm leading-5 text-gray-900">{listing.word.word}</div>
                                    </td>

                                    <td className="px-5 py-4 whitespace-no-wrap border-b border-gray-200">
                                        <p>{listing.word.description}</p>
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
                </div>
            </>
            )}
        
        </div>
      </>
    );
  }
  