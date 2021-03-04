import React, { useState, useEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";
import {
  View,
  ImageBackground,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import RNPickerSelect from "react-native-picker-select";
import axios from "axios";

interface IBGEUfRes {
  sigla: string;
}

interface IBGECityRes {
  nome: string;
}

interface UF {
  label: string;
  value: string;
}

interface CITY {
  label: string;
  value: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<UF[]>([]);
  const [cities, setCities] = useState<CITY[]>([]);
  const navigation = useNavigation();

  const [selectedUf, setSelectedUf] = useState("0");
  const [selectedCity, setSelectedCity] = useState("0");

  useEffect(() => {
    axios
      .get<IBGEUfRes[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome"
      )
      .then((res) => {
        const ufInitials = res.data.map((uf) => ({
          label: uf.sigla,
          value: uf.sigla,
        }));

        setUfs(ufInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === "0") return;
    axios
      .get<IBGECityRes[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos?orderBy=nome`
      )
      .then((res) => {
        const cityNames = res.data.map((city) => ({
          label: city.nome,
          value: city.nome,
        }));

        setCities(cityNames);
      });
  }, [selectedUf]);

  function handleNavigationToPoints() {
    navigation.navigate("Points", {
      uf: selectedUf,
      city: selectedCity,
    });
  }

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ImageBackground
          source={require("../../assets/home-background.png")}
          style={styles.container}
          imageStyle={{ height: 900, width: 400 }}
        >
          <View style={styles.main}>
            <View>
              <View style={styles.img}>
                <Image source={require("../../assets/logo.png")} />
              </View>
              <Text style={styles.title}>
                Seu marketplace de coleta de resíduos.
              </Text>
              <Text style={styles.description}>
                Ajudamos pessoas a encontrarem pontos de coleta de forma
                eficiente.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <RNPickerSelect
              style={{ ...pickerSelectStyles }}
              onValueChange={(value) => setSelectedUf(value)}
              items={ufs}
              placeholder={{
                label: "Selecione a UF",
                value: null,
              }}
            />

            <RNPickerSelect
              style={{ ...pickerSelectStyles }}
              onValueChange={(value) => setSelectedCity(value)}
              items={cities}
              placeholder={{
                label: "Selecione a Cidade",
                value: null,
              }}
            />

            <RectButton
              style={styles.button}
              onPress={handleNavigationToPoints}
            >
              <View style={styles.buttonIcon}>
                <Text>
                  <FontAwesome name="arrow-right" color="#fff" size={24} />
                </Text>
              </View>
              <Text style={styles.buttonText}>Procurar ponto de coleta</Text>
            </RectButton>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: "center",
  },

  img: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#322153",
    fontSize: 32,
    fontFamily: "Ubuntu_700Bold",
    maxWidth: 260,
    marginTop: 130,
  },

  description: {
    color: "#6C6C80",
    fontSize: 16,
    marginTop: 16,
    fontFamily: "Roboto_400Regular",
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  // input: {
  //   height: 60,
  //   backgroundColor: "#f5eeee",
  //   borderRadius: 10,
  //   marginBottom: 8,
  //   paddingHorizontal: 24,
  //   fontSize: 16,
  //   // fontWeight: "bold",
  // },

  button: {
    backgroundColor: "#34CB79",
    height: 60,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    flex: 1,
    justifyContent: "center",
    textAlign: "center",
    color: "#FFF",
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
  },

  inputAndroid: {
    color: "#868484",
    backgroundColor: "#f8efef",
    marginBottom: 10,
    borderWidth: 30,
    borderRadius: 50,
  },
});

export default Home;
