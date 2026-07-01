import React from 'react';
import styles from './Card.module.css';
import { Link, useNavigate } from 'react-router-dom';

const Card = (props) => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  const navigate = useNavigate();
  const poster = props.img || '';
 

  const openWatch = () => {
    if (typeof props.sow === 'function') {
      props.sow(props.id, props.type);
    }
  };

 

  return (

    <div
      className={styles.card}
      style={{ backgroundImage: `url(${poster}), linear-gradient(to top left,#1119,#1119)` }}
      onClick={() => {
        openWatch();
        
      }}
      title={props.name}
    >
   
      {poster === '' ? <h1 className={styles.mname}>{props.name}</h1> : ''}
      <h3 className={styles.rating}>{props.rating?.toFixed(1)}</h3>
    </div>
  );
};

export default Card;
