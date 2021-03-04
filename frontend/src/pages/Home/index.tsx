import React from 'react';
import { RiTruckLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';

import './styles.css';

import logo from '../../assets/logo6.png';

const Home = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
          <img src={logo} alt="Ecoleta" />
        </header>

        <main>
          <h1>Seu marketplace de coleta de resíduos.</h1>
          <p>
            Ajudamos pessoas a encontrarem pontos
            <br /> de coleta de forma eficiente.
          </p>

          <Link to="/create-point">
            <span>
              <RiTruckLine />
            </span>

            <strong>Cadastrar ponto de coleta</strong>
          </Link>
        </main>
      </div>
    </div>
  );
};

export default Home;
