import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FaArrowLeft, FaRecycle } from 'react-icons/fa';

import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import Leaflet from 'leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import InputMask from 'react-input-mask';

import api from '../../services/api';

import './styles.css';
import Modal, { useModal } from '../../components/Modal';

import Dropzone from '../../components/DropZone';

import 'leaflet/dist/leaflet.css';

import logo from '../../assets/logo6.png';
import truck from '../../assets/truck.svg';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const mapIcon = Leaflet.icon({
  iconUrl: truck,

  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

interface ErrorData {
  error: boolean;
  message: string;
}

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUfResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [errorData, setErrorData] = useState<ErrorData>({
    error: false,
    message: '',
  });

  const completedModal = useModal(false);

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [initialPosition, setInicialPosition] = useState<[number, number]>([
    0,
    0,
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItem] = useState<number[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const history = useHistory();

  //functions
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      setInicialPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUfResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufInitials = response.data.map((uf) => uf.sigla);

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }
    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);

        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;

    setSelectedUf(uf);
  }

  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;

    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData({ ...formData, [name]: value });
  }

  function handleSelectItem(id: number) {
    const alreadySeleted = selectedItems.findIndex((item) => item === id);
    if (alreadySeleted >= 0) {
      const filteredItems = selectedItems.filter((item) => item !== id);

      setSelectedItem(filteredItems);
    } else {
      setSelectedItem([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('uf', uf);
    data.append('city', city);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('items', items.join(','));

    if (selectedFile) {
      data.append('image', selectedFile);
    }

    const response = await api.post('points', data);
    if (response.status !== 200) {
      setErrorData({
        error: true,
        message: 'Erro ao cadastrar o ponto de coleta.',
      });
      return;
    }
    completedModal.open();
    setTimeout(() => {
      history.push('/');
    }, 3000);
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FaArrowLeft size={17} />
          Voltar para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <FaRecycle size={80} color="#3d266b" />

        <h1>Cadastro do Ponto de Coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        {/* <fieldset>
          <legend>Dados</legend>
        </fieldset> */}

        <fieldset>
          <div className="field">
            <label htmlFor="name">Nome da Entidade:</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail:</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">
                <span>WhatsApp:</span>
              </label>
              <InputMask
                maskChar={null}
                name="whatsapp"
                id="whatsapp"
                type="text"
                mask="+5599999999999"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            {/* <span> Selecione sua localidade:</span> */}
          </legend>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectedUf}
              >
                <option value="0">Selecione um estado</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2> Selecione um local no mapa</h2>
          </legend>
        </fieldset>

        <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker icon={mapIcon} position={selectedPosition}>
            <Popup>Endereço selecionado!</Popup>
          </Marker>
        </Map>

        <fieldset>
          <legend>
            <h2>Ítems de coleta</h2>
            <span> Selecione um ou mais items abaixo:</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span> {item.title} </span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>

      <Modal
        opened={errorData.error}
        handleClose={() => setErrorData({ error: false, message: '' })}
        hasCloseButton
      >
        <div className="icon-area red-icon">
          <FiXCircle />
        </div>
        <div className="text-area">
          <div>Erro no cadastro</div>
          <div className="medium">{errorData.message}</div>
          <div className="medium">
            Esse pode ser um erro com a sua internet. Caso persista, entre em
            contato pelo e-mail:
          </div>
          <div className="small">eduardo_y05@outlook.com</div>
        </div>
      </Modal>

      <Modal
        opened={completedModal.modalOpen}
        hasCloseButton={false}
        handleClose={() => {}}
      >
        <div className={`icon-area green-icon`}>
          <FiCheckCircle />
        </div>
        <div className="text-area">
          <div>Cadastro Concluído!</div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatePoint;
