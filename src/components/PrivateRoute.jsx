import { Outlet, Navigate } from "react-router-dom";
import useAuthStatus from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

export default function PrivateRoute() {
    //ログイン状態を取得
    const {loggedIn, checkingStatus} = useAuthStatus();

    //ログインチェック処理中の場合
    if (checkingStatus){
      return <Spinner />
    }

    //ログイン状態のみアクセス許可(Outlet)、その以外はログイン画面表示
  return loggedIn ? <Outlet /> : <Navigate to="/sign-in" />;
}
