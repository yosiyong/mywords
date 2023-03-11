import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FcMenu } from "react-icons/fc";

export default function Header() {

  const [pageState, setPageState] = useState("ログイン");
  const [openMenu, setOpenMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // console.log(location)

  //ログイン状態によって、ログイン、プロフィールメニュー表示を切り替える
  //const auth = getAuth();
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
    menuFunction();
    auth.signOut();
    navigate("/sign-in");
  }

  const menuFunction = () => {
    setOpenMenu(!openMenu);
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-0 z-50">
      <header className="flex justify-between items-center px-3 max-w-6xl mx-auto">
        <div>
          <img src="/logo-no-background.svg" 
          alt="logo" 
          className="h-10 cursor-pointer" 
          onClick={()=>navigate("/")}/>
        </div>

        {/* mobile場合のメニュー */}
        {openMenu ? (
          <div className='flex flex-row absolute z-10 top-0 right-0  min-h-fit min-w-full'>
            <div className='basis-1/2'></div>

            <div className='basis-1/2 bg-white'>
              <ul className=' text-center border-l-2 '>
                <li className='p-2 border-b-2'>
                  <button onClick={menuFunction} className='font-bold'>
                    閉じる
                  </button>
                </li>
                <li className="p-2 border-b-2" onClick={() => {pageState == "学習" ? navigate("/study"):navigate("/sign-in"); menuFunction();}}>{pageState}</li>

                  {pageState == "学習" && (
                  <li className="p-2 border-b-2" onClick={() => {navigate("/word-save"); menuFunction();}}>単語登録</li>
                  )}

                  {pageState == "学習" && (
                  <p onClick={onLogout} className="p-2 border-b-2">ログアウト</p>
                  )}
              </ul>
            </div>
          </div>
        ) : undefined}

        {/* pcの場合のメニュー */}
        <div>
          <ul className="md:flex hidden space-x-10">
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

        {/* mobile場合のメニューボタン */}
        <button onClick={menuFunction} className='flex md:hidden'>
          <FcMenu />
        </button>
      </header>
    </div>
  )
}
