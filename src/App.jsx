import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import ForgotPassword from "./pages/ForgotPassword";
import Header from "./components/Header";
import WordSave from "./pages/WordSave";
import Study from "./pages/Study";

function App() {
  return (
    <>
      <Router>
        <Header/>
        <Routes>

          {/* ログイン状態の場合のみアクセス可能 */}
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Study/>}/>
          </Route>
          <Route path="/study" element={<PrivateRoute />}>
            <Route path="/study" element={<Study/>}/>
          </Route>

          <Route path="/word-save" element={<PrivateRoute />}>
            <Route path="/word-save" element={<WordSave/>}/>
          </Route>
          
          <Route path="/sign-in" element={<SignIn/>}/>
          <Route path="/sign-up" element={<SignUp/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        />
    </>
  )
}

export default App
