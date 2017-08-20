import React from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { Root, Toast } from 'native-base';
import GigyaSignIn from './GigyaSignIn';

const Gigya = NativeModules.GigyaBridge;

export default class GigyaSignInRoot extends React.Component {
  constructor() {
    super();
    this.state = {
      gigyaAccount: null,
      isSessionValid: null,
    };
    this.gigyaManagerEmitter = new NativeEventEmitter(Gigya);
  }

  componentWillMount() {
    this.accountDidLoginSubscription = this.gigyaManagerEmitter.addListener(
      'AccountDidLogin',
      this.onAccountDidLogin,
    );

    Gigya.initBridge();
    Gigya.isSessionValid(this.onIsSessionValidCompleted);
  }

  componentWillUnmount() {
    if (this.accountDidLoginSubscription) {
      this.accountDidLoginSubscription.remove();
    }
    if (this.AccountDidLogoutSubscription) {
      this.AccountDidLogoutSubscription.remove();
    }
  }

  onAccountDidLogin = (account) => {
    this.setState({
      gigyaAccount: JSON.parse(account),
      isSessionValid: true,
    }, () => {
      this.props.navigator.resetTo({
        screen: 'example.Types.GigyaLoggedInRoot',
        title: 'Welcome',
        passProps: {
          account: this.state.gigyaAccount,
        },
      });
    });   
  };

  onAccountDidLogout = () => {
    this.notifyUser('Logged out successfully');
    this.setState({ isSessionValid: false, gigyaAccount: null });
  };

  onIsSessionValidCompleted = (error, isValid) => {
    if (!isValid) {
      this.setState({ isSessionValid: false });
    } else {
      Gigya.getAccountInfo(this.onGetAccountInfoCompleted);
    }
  };

  onGetAccountInfoCompleted = (error, account) => {
    // Manage errors here
    
    if (account) {
      this.onAccountDidLogin(account);
    }
  };

  login = (loginId, password) => {
    if (!loginId || !password) {
      this.notifyUser('Please provide username and password');
      return;
    }

    Gigya.login(loginId, password, this.onLoginCompleted);
  };

  showScreenSet = () => {
    Gigya.showScreenSet('newJan-RegistrationLogin', this.onScreenSetCompleted);
  };

  socialLogin = provider => Gigya.socialLogin(provider, this.onSocialLoginCompleted);

  onLoginCompleted = (error) => {
    if (error) {
      this.notifyUser(error);
    }
  };

  onScreenSetCompleted = (error) => {
    this.notifyUser(error);
  };

  onSocialLoginCompleted = error => this.checkErrors(error);

  checkErrors = (error) => {
    if (!error) return;
    this.notifyUser(error);
  };

  notifyUser = msg => Toast.show({
    text: msg,
    position: 'bottom',
    buttonText: 'Dismiss',
    duration: 2000,
  });

  render() {
    if (this.state.isSessionValid===null) return null;

    return (
      <Root>
        <GigyaSignIn
          onSocialLoginPressed={this.socialLogin}
          onLoginPressed={this.login}
          onScreensetPressed={this.showScreenSet}
        />
      </Root>
    );
  }
}
