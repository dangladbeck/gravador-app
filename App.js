import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import Toast from 'react-native-toast-message';


export default function App() {

  const [gravando, setGravando] = useState(false);
  const [permissaoConcedida, setPermissaoConcedida] = useState(false);
  const [audio, setAudio] = useState(null);
  const [gravacao, setGravacao] = useState(null);

  const exibirMensagem = (msg) => {
    Toast.show({
      type: "info",
      text1: msg,
      props: {
        accessible: true,
        acessibilityRole: "alert"
      }
    });
  };

  const solicitarPermissaoMicrofone = async () => {
    const {concedida} = await Audio.requestPermissionsAsync();
    setPermissaoConcedida(concedida);
    if (!concedida) {
      exibirMensagem("Para prosseguir, conceda acesso ao microfone.");
    }
  };

  const iniciarGravacao = async () => {
    try {
      if (!permissaoConcedida) {
        exibirMensagem("Permissão ao microfone não foi concedida.");
        return;
      }
      // Configurações para IOS
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });
      
      // Criar e iniciar uma nova gravação de áudio
      const novaGravacao = new Audio.Recording();

      await novaGravacao.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await novaGravacao.startAsync();
      setGravacao(novaGravacao);
      setGravando(true);
    } catch (error) {
      exibirMensagem("Erro ao iniciar a gravação : " + error);
    }
  };

  const pararGravacao = async () => {
    try {
      await gravacao.stopAndUnloadAsync();
      const uri = gravacao.getURI();
      const {sound} = await Audio.Sound.createAsync({uri});

      setAudio(sound);
      setGravacao(null);
      setGravando(false);
      exibirMensagem("Gravação finalizada! Arquivo salvo em \n" + uri);
    } catch (error) {
      exibirMensagem("Erro ao parar gravação : " + error);
    }
  };

  const playAudio = async () => {
    if (audio) {
      await audio.replayAsync();
    }
    else {
      exibirMensagem("Nenhum áudio para reproduzir.");
    }
  };

  useEffect(() => {  // executado quando a aplicação for aberta
    solicitarPermissaoMicrofone();
    return () => {
      if (audio) {
        audio.unloadAsync();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Gravador</Text>
      <View style={styles.button}>
        <Button title={gravando ? "Parar Gravação" : "Iniciar Gravação"}
          onPress={gravando ? pararGravacao : iniciarGravacao}
        />
      </View>
      <View style={styles.button}>
        <Button title={"Reproduzir Áudio"} onPress={playAudio}/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    margin: 5,
    width: 150,
  }
});
