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
import WordsList from "./pages/WordsList";
import WordEdit from "./pages/WordEdit";
import Settings from "./pages/Settings";
import WordCategory from "./pages/WordCategory";
import CategoriesList from "./pages/CategoriesList"
import CategoryEdit from "./pages/CategoryEdit";
import { SettingsProvider } from "./context/SettingsContext";

function App() {

  return (
    <SettingsProvider>
      <Router>
        <Header/>
        <Routes>

          {/* ログイン状態の場合のみアクセス可能 */}
          <Route path="/settings" element={<PrivateRoute />}>
            <Route path="/settings" element={<Settings/>}/>
          </Route>
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" element={<Study/>}/>
          </Route>
          <Route path="/study" element={<PrivateRoute />}>
            <Route path="/study" element={<Study/>}/>
          </Route>
          <Route path="/word-category" element={<PrivateRoute />}>
            <Route path="/word-category" element={<WordCategory/>}/>
          </Route>

          <Route path="/categories-list" element={<PrivateRoute />}>
            <Route path="/categories-list" element={<CategoriesList/>}/>
          </Route>

          <Route path="category-edit" element={<PrivateRoute />}>
            <Route path="/category-edit/:listingId" element={<CategoryEdit/>}/>
          </Route>
          <Route path="/word-save" element={<PrivateRoute />}>
            <Route path="/word-save" element={<WordSave/>}/>
          </Route>

          <Route path="word-edit" element={<PrivateRoute />}>
            <Route path="/word-edit/:listingId" element={<WordEdit/>}/>
          </Route>

          <Route path="/words-list" element={<PrivateRoute />}>
            <Route path="/words-list" element={<WordsList/>}/>
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
    </SettingsProvider>
  )
}

export default App
