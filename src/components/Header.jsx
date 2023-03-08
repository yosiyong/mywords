import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
export default function Header() {

  const [pageState, setPageState] = useState("ログイン");
  const location = useLocation();
  const navigate = useNavigate();
  // console.log(location)

  //ログイン状態によって、ログイン、プロフィールメニュー表示を切り替える
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setPageState("学習");
      } else {
        setPageState("ログイン");
      }
    });
  },[auth]);

  function pathMatchRoute(route) {

    if (route === location.pathname){
      return true
    }
  }

  function onLogout() {
    auth.signOut();
    navigate("/sign-in");
  }

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src="/logo-no-background.svg" 
          alt="logo" 
          className="h-10 cursor-pointer" 
          onClick={()=>navigate("/")}/>
        </div>
        <div>
          <ul className="flex space-x-10">
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${(pathMatchRoute("/sign-in") || pathMatchRoute("/study")) && "text-black border-b-red-500"}`} 
            onClick={() => pageState == "学習" ? navigate("/study"):navigate("/sign-in")}>{pageState}</li>

            {pageState == "学習" && (
            <li className={`cursor-pointer py-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent ${pathMatchRoute("/word-save") && "text-black border-b-red-500"}`} 
            onClick={() => navigate("/word-save")}>単語登録</li>
            )}

            {pageState == "学習" && (
            <li className="py-3 text-sm text-blue-600 hover:text-blue-800 transition duration-200 ease-in-out">{auth.currentUser.displayName}</li>
            )}

            {pageState == "学習" && (
            <p onClick={onLogout} className="py-3 text-sm text-red-600 hover:text-red-800 transition duration-200 ease-in-out cursor-pointer">ログアウト</p>
            )}
          </ul>
        </div>
      </header>
    </div>
  )
}
