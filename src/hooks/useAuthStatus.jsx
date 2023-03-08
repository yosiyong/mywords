import { getAuth,onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function useAuthStatus() {
    const [loggedIn, setLoggedIn] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //ログイン済みフラグ
                setLoggedIn(true);
            }

            //チェック処理中フラグを初期化
            setCheckingStatus(false);
        });
    }, []);

  return { loggedIn, checkingStatus};
}
