import { BsStar, BsStarHalf, BsStarFill } from 'react-icons/bs';

const Rating = ({ value, text = '' }) => {
  return (
    <div className='flex items-center'>
      <span className='text-[#f1c40f] mx-[2px]'>{value >= 1 ? <BsStarFill /> : value >= 0.5 ? <BsStarHalf /> : <BsStar />}</span>
      <span className='text-[#f1c40f] mx-[2px]'>{value >= 2 ? <BsStarFill /> : value >= 1.5 ? <BsStarHalf /> : <BsStar />}</span>
      <span className='text-[#f1c40f] mx-[2px]'>{value >= 3 ? <BsStarFill /> : value >= 2.5 ? <BsStarHalf /> : <BsStar />}</span>
      <span className='text-[#f1c40f] mx-[2px]'>{value >= 4 ? <BsStarFill /> : value >= 3.5 ? <BsStarHalf /> : <BsStar />}</span>
      <span className='text-[#f1c40f] mx-[2px]'>{value >= 5 ? <BsStarFill /> : value >= 4.5 ? <BsStarHalf /> : <BsStar />}</span>
      <span className='text-[#f1c40f] font-bold ml-2'>{text}</span>
    </div>
  );
};

export default Rating;
