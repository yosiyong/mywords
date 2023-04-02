import { ImSad } from "react-icons/im";
import { ImHappy } from "react-icons/im";
import ReactCardFlip from 'react-card-flip';
import { useState} from "react";
import React from "react";
import { FcEditImage } from "react-icons/fc";
import { toast } from "react-toastify";

export default function ListingItem({ id, listing, history, onCorrect, onInCorrect, onEdit, inputmode }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  function flipCard() {
    setIsFlipped(!isFlipped);
  }

  function onBlur(e) {
    let boolean = null;
    if (e.target.value != "") {
      if (e.target.value === listing.description) {
        toast.success("正解です。");
        onCorrect(listing.id);
      }else{
        toast.success("不正解です。");
        onInCorrect(listing.id);
        e.target.value = "";
      }
    }
  }

  //改行コード変換
  const MultiLineBody = ({ body }) => {
    const texts = body.split('\n').map((item, index) => {
      return (
        <React.Fragment key={index}>
          {item}
          <br />
        </React.Fragment>
      );
    });
    return <div>{texts}</div>;
  };

  return (
    <>
     {!inputmode && (
      <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
        {/* 表：単語 */}
        <li onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
            <div className="w-full h-[300px] p-[10px] flex flex-col justify-center items-center pb-10 mt-3">
              <h6 className="text-xl font-medium text-gray-900 dark:text-white">
                {listing.word}
              </h6>
              <span className="absolute bottom-4 left-4 mt-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">正解率：{history.correct_rate}%</span>
            </div>
        </li>

        {/* 裏：説明 */}
        <li onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
          <div className="w-full h-auto p-[10px] flex flex-col justify-center items-center pb-16 mt-3">
            <span className="text-lg text-gray-500 dark:text-gray-400"><MultiLineBody body={listing.description} /></span>
          </div>

          {onCorrect && (
            <ImHappy
              className="absolute bottom-4 left-4 w-10 h-10 cursor-pointer "
              onClick={() => onCorrect(listing.id)}
            />
          )}

          {onEdit && (
            <FcEditImage
              className="absolute bottom-4 item-center w-5 h-5 cursor-pointer "
              onClick={() => onEdit(listing.id)}
            />
          )}
          
          {onInCorrect && (
            <ImSad
              className="absolute bottom-4 right-4 w-10 h-10 cursor-pointer text-red-500"
              onClick={() => onInCorrect(listing.id)}
            />
          )}
        </li>
      </ReactCardFlip>
      )}

      {inputmode && (
        <ul>
          <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
              <div className="w-full h-auto p-[10px] flex flex-col justify-center items-center pb-10 mt-3">
                <h6 className="text-xl font-medium text-gray-900 dark:text-white">
                  {listing.word}
                </h6>
                <span className="absolute bottom-4 left-4 mt-3 text-sm font-semibold text-gray-400 border-b-[3px] border-b-transparent">正解率：{history.correct_rate}%</span>
              </div>
          </li>
          <li className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
            <div className="w-full h-auto p-[10px] flex flex-col justify-center items-center pb-16 mt-3">
                <textarea type="text" id="description" onBlur={onBlur} 
                placeholder="回答を書いてください。" required maxLength="1000" minLength="1" 
                className="w-full px-4 py-2 h-[300px] text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600" />
            </div>

            {onCorrect && (
              <ImHappy
                className="absolute bottom-4 left-4 w-10 h-10 cursor-pointer "
                onClick={() => onCorrect(listing.id)}
              />
            )}

            {onEdit && (
              <FcEditImage
                className="absolute bottom-4 item-center w-5 h-5 cursor-pointer "
                onClick={() => onEdit(listing.id)}
              />
            )}
            
            {onInCorrect && (
              <ImSad
                className="absolute bottom-4 right-4 w-10 h-10 cursor-pointer text-red-500"
                onClick={() => onInCorrect(listing.id)}
              />
            )}
          </li>
        </ul>
      )}
    </>
  );
}
