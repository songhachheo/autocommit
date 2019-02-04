import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import Loading from '../Components/Loading';

import logo from '../img/logo-trans.png';
import imgStage3 from '../img/steroidtocat.png';
import imgStage2 from '../img/orderedlistocat.png';
import imgStage1 from '../img/deckfailcat.png';
// Todo
// Copyright images from https://octodex.github.com/

export default class DashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // autocommits: false,
      dbUser: {
        autocommits: false
      },
      buttonSpinner: false,
      modal: false
    }
  }

  componentDidMount() {
    console.log('👍 Did Mount run');
    const username = this.props.user.displayName;

    this.props.db.getUserFromDB(username)
    .then((dbUser) => {
      console.log('📡 dbUser got', dbUser);
      if (!dbUser) return this.componentDidMount();
      this.setState({
        dbUser
      });
    })
  }

  generateKey() {
    this.setState({
      buttonSpinner: true
    });

    // Taking unused key from database
    this.props.db.getUnusedKey().then(key => {
      const keyName = Object.keys(key)[0];
      const keyValue = key[keyName];
      console.log(keyName, keyValue);

      const username = this.props.user.displayName;

      // Assigning key to user
      this.props.db.assignKeyToUser(username, keyName, keyValue)
      .then((dbUser) => {

        // Removing key from 'unused' table
        this.props.db.removeUnusedKey(keyName).then(() => {
          
          this.setState({
            dbUser,
            buttonSpinner: false
          });
        });
      });
    });
  }

  toggleCommits(toggle) {
    const username = this.props.user.displayName;

    this.props.db.toggleCommits(username, toggle)
    .then(() => {
      this.setState({
        dbUser: {
          ...this.state.dbUser,
          autocommits: toggle
        }
      });
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  renderModal() {
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggleModal.bind(this)} className={this.props.className}>
        <ModalHeader toggle={this.toggleModal.bind(this)}>Your public SSH key</ModalHeader>
        <ModalBody>
          <p>
            This is your unique public SSH key. It is used to identify our server as you when it will make auto commits. <br/><br/>
            <a href="https://github.com/settings/ssh/new" target="blank">Connect this key to your GitHub account</a> and then you can enable Autocommits.
          </p>
          <div className="p-4 bg-grey text-white">
            <code>
              <small>
                {this.state.dbUser.keyValue}
                <button type="button" class="btn btn-outline-secondary btn-sm btn-block mt-2">Copy to clipboard</button>
              </small>
            </code>
          </div>
          <p className="mt-2 mb-0 text-center"><small>Make sure to enable autocommits only after you connected SSH key!</small></p>
          <button type="button" onClick={() => {this.toggleCommits(true); this.toggleModal()}} class="btn btn-success btn-sm btn-block mt-1">Enable Autocommits</button>
        </ModalBody>
      </Modal>
    );
  }

  renderStatusBlock() {
    const imgSrc=()=>{
      if (this.state.dbUser.autocommits)
        return imgStage3;
      if (this.state.dbUser.keyName)
        return imgStage2;
      return imgStage1;
    }
    const title=()=>{
      if (this.state.dbUser.autocommits)
        return 'You are enabled 😎';
      if (this.state.dbUser.keyName)
        return 'Auto commits disabled 😞';
      return 'Generate your key';
    }
    const text=()=>{
      if (this.state.dbUser.autocommits)
        return (
          <p>Your automatic commits are successfully scheduled and will automatically run each day <code>n</code> times
          You can disable them any time with button below</p>
        );
      if (this.state.dbUser.keyName)
        return (
          <p>You account is currently disabled from Autocommit system. <br/>
          To schedule on your autocommits press <strong>Enable Autocommits</strong> button below. <br/>
          Make sure that you added given SSH-key to <a href="https://github.com/settings/ssh/new" target="blank">your GitHUb Account</a></p>
        );
      return (
        <p>To ensure GitHub that it is your contributions, we will now assign you a unique SSH key which you will need to <a href="https://github.com/settings/ssh/new" target="blank">add to your GitHub account</a>.
        Press <strong>Generate Key</strong> and follow further instructions.</p>
      );
    }
    const btn=()=>{
      if (this.state.dbUser.autocommits)
        return (
          <span>
            <button className="btn btn-danger" type="button"
              onClick={() => this.toggleCommits(false)}
            >
              Disable Autocommits
            </button>
          </span>
        );
      if (this.state.dbUser.keyName)
        return (
          <span>
            <button className="btn btn-success" type="button"
            onClick={this.toggleModal.bind(this)}
            >
              Enable Autocommits
            </button>
          </span>
        );
      return (
        <button className="btn btn-primary" type="button" 
          disabled={this.state.buttonSpinner ? true : false}
          onClick={() => this.generateKey()}
        >
          {this.state.buttonSpinner ? <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span> : null}
          {this.state.buttonSpinner ? 'Generating key...' : 'Generate Key'}
        </button>
      );
    }

    if (!this.state.dbUser.email)
      return <Loading />

    return (
      <div className="text-center w-100 mb-2">
        <img className="mb-1" src={imgSrc()} alt="" width="130" height="130" />
        <h1 className="h3 mb-3 font-weight-normal">{title()}</h1>
        {text()}
        {btn()}
      </div>
    );
  }

  render() {
    console.log('fef', this.state);
    return (
      <div>
        {this.renderModal()}
        <header>
          <nav className="navbar navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
              <span className="navbar-brand text-white">
                <img src={logo} width="30" height="30" className="d-inline-block align-top mr-2" alt="" />
                Auto Commit
              </span>
              <img src={this.props.user.photoURL} width="30" height="30" className="d-inline-block ml-2 user-avatar-sm" alt="" />
            </div>
          </nav>
        </header>

        <div className="d-flex flex-column justify-content-between" style={{height: 'calc(100vh - 56px)'}}>
          <main role="main" className="container">
            <div className="d-flex align-items-center p-3 my-3 text-white bg-grey rounded shadow">
              <img className="mr-3" src={logo} alt="" width="48" height="48" />
              <div className="lh-100 w100">
                <h6 className="mb-0 lh-100 d-flex justify-content-between w-100"><span>GitHub autocommit</span><i className="fas fa-magic"></i> </h6> 
                <small>This service is used to automatically make contributions on GitHub and keep up your activity.</small>
              </div>
            </div>

            <div className="my-3 p-3 bg-white rounded shadow">
              <h6 className="border-bottom border-gray pb-2 mb-0 d-flex justify-content-between w-100"><span><i className="fab fa-github mr-1"></i> Connected account</span><i className="fas fa-user"></i></h6>
              <div className="media text-muted pt-3">
                <img src={this.props.user.photoURL} width="32" height="32" className="bd-placeholder-img mr-2 rounded" alt="" />
                <p className="media-body pb-0 mb-0 small lh-125">
                  <span className="d-flex justify-content-between align-items-center w-100">
                    <strong className="text-gray-dark">@{this.props.user.displayName}</strong>
                    <span className="text-danger text-link" onClick={() => this.props.logout()}>Logout</span>
                  </span>
                  {this.props.user.email}
                </p>
              </div>
            </div>

            <div className="my-3 p-3 bg-white rounded shadow">
              <h6 className="border-bottom border-gray pb-2 mb-0 d-flex justify-content-between w-100">
                <span><i className="fas fa-cubes mr-1"></i> Auto commit status</span>
                <span className={`badge badge-${this.state.dbUser.autocommits ? 'success' : 'danger'}`}>{this.state.dbUser.autocommits ? 'Enabled' : 'Disabled'}</span>
              </h6>
              <div className="media text-muted pt-3">
                {this.renderStatusBlock()}
              </div>
            </div>

            <div className="my-3 p-3 bg-white rounded shadow">
              <h6 className="border-bottom border-gray pb-2 mb-0 d-flex justify-content-between w-100"><span><i className="fas fa-server mr-1"></i> Countdown to next commit</span></h6>
                <div className="progress mt-3">
                  <div className="progress-bar progress-bar-striped bg-success progress-bar-animated" role="progressbar" style={{width: '25%'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
          </main>

          <footer className="footer mt-auto py-3 shadow-lg">
            <div className="container text-center">
              <span className="text-muted"><a href="https://github.com/kirillovmr" target="blank">@kirillovmr</a> | <span className="text-link" onClick={() => this.props.changePage('docs')}>Docs</span></span>
            </div>
          </footer>
        </div>
      </div>
    );
  }
}