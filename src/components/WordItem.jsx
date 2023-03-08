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
      
      {/* 表：単語 */}
      <div onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
        <div className="flex flex-col items-center pb-10 mt-3">
          <h5 className="text-xl font-medium text-gray-900 dark:text-white">
            {listing.word}
          </h5>
        </div>
      </div>

      {/* 裏：説明 */}
      <div onClick={flipCard} className="relative bg-white flex flex-col justify-between items-center shadow-md hover:shadow-xl rounded-md overflow-hidden transition-shadow duration-150 m-[10px]">
        <div className="flex flex-col items-center pb-10 mt-3">
          <span className="text-sm text-gray-500 dark:text-gray-400"><MultiLineBody body={listing.description} /></span>
        </div>
      
        {onCorrect && (
          <ImHappy
            className="absolute bottom-2 left-2 h-4 cursor-pointer "
            onClick={() => onCorrect(listing.id)}
          />
        )}
        
        {onInCorrect && (
          <ImSad
            className="absolute bottom-2 right-2 h-[14px] cursor-pointer text-red-500"
            onClick={() => onInCorrect(listing.id)}
          />
        )}
      </div>
    </ReactCardFlip>
  );
}
