import Moment from "react-moment";
import { ImSad } from "react-icons/im";
import { ImHappy } from "react-icons/im";
import ReactCardFlip from 'react-card-flip';
import { useState} from "react";
import React from "react";

export default function ListingItem({ id, listing, history, onCorrect, onInCorrect }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  function flipCard() {
    setIsFlipped(!isFlipped);
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
    <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
      <li onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
        {/* 表：単語 */}

          <div className="w-full h-[300px] p-[10px] flex flex-col justify-center items-center pb-10 mt-3">
            <h6 className="text-xl font-medium text-gray-900 dark:text-white">
              {listing.word}
            </h6>
          </div>

      </li>
      {/* 裏：説明 */}
      <li onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
        <div className="w-full h-[300px] p-[10px] flex flex-col justify-center items-center pb-10 mt-3">
          <span className="text-lg text-gray-500 dark:text-gray-400"><MultiLineBody body={listing.description} /></span>
        </div>
     
        {onCorrect && (
          <ImHappy
            className="absolute bottom-4 left-4 w-10 h-10 cursor-pointer "
            onClick={() => onCorrect(listing.id)}
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
  );
}
