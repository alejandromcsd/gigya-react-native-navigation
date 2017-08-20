import React, { Component } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Container, Content, Footer, FooterTab, Button, Icon, Text, H3 } from 'native-base';
import Dimensions from 'Dimensions';

const Gigya = NativeModules.GigyaBridge;

const styles = {
  welcome: { alignSelf: "center", marginTop: 50 },
  container: {
    backgroundColor: '#FAFAFA',
    padding: 10,
  },
};

class GigyaLoggedInRoot extends Component {
  constructor() {
    super();
    this.gigyaManagerEmitter = new NativeEventEmitter(Gigya);
  }

  componentWillMount() {
    this.AccountDidLogoutSubscription = this.gigyaManagerEmitter.addListener(
      'AccountDidLogout',
      this.onAccountDidLogout,
    );
  }

  logout = () => {
    Gigya.logout();
  }

  onAccountDidLogout = () => {
    this.props.navigator.resetTo({
      screen: 'example.Types.GigyaSignInRoot',
      title: 'Log in'
    });
  };

  viewProfile = () => {
    Gigya.showScreenSet(
      'Default-ProfileUpdate',
      {
        x:0,
        y:0,
        w:Dimensions.get('window').width,
        h:Dimensions.get('window').height,
        screenSetParams:{}
      },
      () => {
        console.log("OnScreenSetCompleted callback");
      }
    );
  };

  render() {
    const { account } = this.props;

    return(
      <Container style={styles.container}>
        <Content>
          <H3 style={styles.welcome}>Welcome {account.profile.firstName}</H3>
          <H3></H3> 
          <H3></H3> 
          <H3></H3>
           <Button
              onPress={this.viewProfile}
              style={styles.button}
              block
              success
            >
              <Text>View Profile</Text>
            </Button>
        </Content>
        <Footer>
          <FooterTab>
            <Button vertical onPress={this.logout}>
              <Icon name="log-out" />
              <Text>Log out</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
    );
  }
}

export default GigyaLoggedInRoot;
