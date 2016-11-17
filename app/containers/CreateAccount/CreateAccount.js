import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Radium from 'radium';
import Helmet from 'react-helmet';

import { Loader, ImageCropper } from 'components';
import { globalStyles } from 'utils/globalStyles';
import { globalMessages } from 'utils/globalMessages';
import { FormattedMessage } from 'react-intl';

import { getSignUpData, createAccount } from './actions';

let styles;

export const CreateAccount = React.createClass({
	propTypes: {
		accountData: PropTypes.object,
		dispatch: PropTypes.func,
	},

	statics: {
		readyOnActions: function(dispatch, params) {
			return Promise.all([
				dispatch(getSignUpData(params.hash))
			]);
		}
	},

	getInitialState() {
		return {
			userImageFile: null,
			userImageURL: undefined,
			firstName: '',
			lastName: '',
			password: '',
			bio: '',
			publicEmail: '',
			website: '',
			twitter: '',
			orcid: '',
			github: '',
			googleScholar: '',
			validationError: undefined,
		};
	},

	inputUpdate: function(key, evt) {
		const value = evt.target.value || '';
		this.setState({ [key]: value });
	},

	bioUpdate: function(evt) {
		const bio = evt.target.value || '';
		this.setState({ bio: bio.substring(0, 140) });
	},

	handleFileSelect: function(evt) {
		if (evt.target.files.length) {
			this.setState({ userImageFile: evt.target.files[0] });
		}
	},

	cancelImageUpload: function() {
		this.setState({ userImageFile: null });
		document.getElementById('userImage').value = null;
	},

	userImageUploaded: function(url) {
		this.setState({ userImageFile: null, userImageURL: url });
		document.getElementById('userImage').value = null;
	},

	validate: function(data) {
		// Check to make sure firstName exists
		if (!data.firstName || !data.firstName.length) {
			return { isValid: false, validationError: <FormattedMessage id="signup.FirstNamerequired" defaultMessage="First Name required" /> };
		}

		// Check to make sure lastName exists
		if (!data.lastName || !data.lastName.length) {
			return { isValid: false, validationError: <FormattedMessage id="signup.LastNamerequired" defaultMessage="Last Name required" /> };
		}

		// Check to make sure email exists
		if (!data.email || !data.email.length) {
			return { isValid: false, validationError: <FormattedMessage id="signup.Emailrequired" defaultMessage="Email required" /> };
		}

		// Check to make sure email is lightly valid (complete validation is impossible in JS - so just check for the most common error)
		const regexTest = /\S+@\S+/;
		if (!regexTest.test(data.email)) {
			return { isValid: false, validationError: <FormattedMessage id="signup.Emailisinvalid" defaultMessage="Email is invalid" /> };
		}

		// Check to make sure password exists
		if (!data.password || data.password.length < 8) {
			return { isValid: false, validationError: <FormattedMessage id="signup.Passwordtooshort" defaultMessage="Password too short" /> };
		}

		return { isValid: true, validationError: undefined };

	},

	createAccountSubmit: function(evt) {
		evt.preventDefault();
		const accountData = this.props.accountData || {};
		const user = accountData.user || {};
		const createAccountData = {
			email: user.email,
			firstName: this.state.firstName,
			lastName: this.state.lastName,
			password: this.state.password,
			bio: this.state.bio,
			publicEmail: this.state.publicEmail,
			website: this.state.website,
			twitter: this.state.twitter,
			orcid: this.state.orcid,
			github: this.state.github,
			googleScholar: this.state.googleScholar,
		};
		const { isValid, validationError } = this.validate(createAccountData);
		this.setState({ validationError: validationError });
		// if (isValid) {
		// 	this.props.dispatch(createAccount(createAccountData));	
		// }
	},
	render() {
		const accountData = this.props.accountData || {};
		const user = accountData.user || {};
		const isLoading = true;
		const serverErrors = {
			emailAlreadyUsed: <FormattedMessage id="signup.Emailalreadyused" defaultMessage="Email already used" />,
			usernameAlreadyUsed: <FormattedMessage id="signup.Usernamealreadyused" defaultMessage="Username already used" />,
		};
		const errorMessage = serverErrors[accountData.errorMessage] || this.state.validationError;
		return (
			<div style={styles.container}>
				<Helmet title={'Create Account · PubPub'} />
				{accountData.error &&
					<div>
						<h1>Invalid Hash</h1>
						This account has either already been created or the hash is invalid
						<p>To signup please begin at <Link to={'/signup'}>Sign Up</Link></p>
					</div>
				}
				
				{accountData.loading &&
					<div>Loading</div>
				}
				
				{user.email &&
					<div>

						<h1><FormattedMessage {...globalMessages.SignUp} /></h1>
						<p>Welcome! You've signed up using <b>{user.email}</b>. A few last steps are needed to create your account.</p>

						<form onSubmit={this.createAccountSubmit}>
							
							<label style={styles.label} htmlFor={'firstName'}>
								<FormattedMessage {...globalMessages.FirstName} />
								<input id={'firstName'} name={'first name'} type="text" style={styles.input} value={this.state.firstName} onChange={this.inputUpdate.bind(this, 'firstName')} />
							</label>
							
							<label style={styles.label} htmlFor={'lastName'}>
								<FormattedMessage {...globalMessages.LastName} />
								<input id={'lastName'} name={'last name'} type="text" style={styles.input} value={this.state.lastName} onChange={this.inputUpdate.bind(this, 'lastName')} />
							</label>
								
							<label style={styles.label} htmlFor={'password'}>
								<FormattedMessage {...globalMessages.Password} />
								<input id={'password'} name={'password'} type="password" style={styles.input} value={this.state.password} onChange={this.inputUpdate.bind(this, 'password')} />
								<div className={'light-color inputSubtext'} to={'/resetpassword'}>
									<FormattedMessage id="signup.PasswordLength" defaultMessage="Must be at least 8 characters" />
								</div>
							</label>
								
							<label htmlFor={'userImage'}>
								<FormattedMessage {...globalMessages.ProfileImage} />
								<img role="presentation" style={styles.userImage} src={this.state.userImageURL} />
								<input id={'userImage'} name={'user image'} type="file" accept="image/*" onChange={this.handleFileSelect} />
							</label>

							<label htmlFor={'bio'}>
								<FormattedMessage {...globalMessages.Bio} />
								<textarea id={'bio'} name={'bio'} type="text" style={[styles.input, styles.bio]} value={this.state.bio} onChange={this.bioUpdate} />
								<div className={'light-color inputSubtext'}>
									{this.state.bio.length} / 140
								</div>
							</label>

							<label htmlFor={'publicEmail'}>
								<FormattedMessage {...globalMessages.PublicEmail}/>
								<input id={'publicEmail'} name={'publicEmail'} type="text" style={styles.input} value={this.state.publicEmail} onChange={this.inputUpdate.bind(this, 'publicEmail')} />
							</label>

							<label htmlFor={'website'}>
								<FormattedMessage {...globalMessages.Website}/>
								<input id={'website'} name={'website'} type="text" style={styles.input} value={this.state.website} onChange={this.inputUpdate.bind(this, 'website')} />
							</label>

							<label htmlFor={'twitter'}>
								Twitter
								<div style={styles.prefixedInputWrapper}>
									<div style={styles.prefix}>@</div>
									<input id={'twitter'} name={'twitter'} type="text" style={[styles.input, styles.prefixedInput]} value={this.state.twitter} onChange={this.inputUpdate.bind(this, 'twitter')} />
								</div>
							</label>

							<label htmlFor={'orcid'}>
								ORCID
								<div style={styles.prefixedInputWrapper}>
									<div style={styles.prefix}>orcid.org/</div>
									<input id={'orcid'} name={'orcid'} type="text" style={[styles.input, styles.prefixedInput]} value={this.state.orcid} onChange={this.inputUpdate.bind(this, 'orcid')} />
								</div>
							</label>
								
							<label htmlFor={'github'}>
								Github
								<div style={styles.prefixedInputWrapper}>
									<div style={styles.prefix}>github.com/</div>
									<input id={'github'} name={'github'} type="text" style={[styles.input, styles.prefixedInput]} value={this.state.github} onChange={this.inputUpdate.bind(this, 'github')} />
								</div>
							</label>
								
							<label htmlFor={'googleScholar'}>
								Google Scholar
								<div style={styles.prefixedInputWrapper}>
									<div style={styles.prefix}>scholar.google.com/citations?user=</div>
									<input id={'googleScholar'} name={'google scholar'} type="text" style={[styles.input, styles.prefixedInput]} value={this.state.googleScholar} onChange={this.inputUpdate.bind(this, 'googleScholar')} />
								</div>
							</label>
								

							<button className={'pt-button pt-intent-primary'} onClick={this.createAccountSubmit}>
								<FormattedMessage {...globalMessages.SignUp} />
							</button>

							<div style={styles.loaderContainer}>
								<Loader loading={isLoading} showCompletion={!errorMessage} />
							</div>

							<div style={styles.errorMessage}>{errorMessage}</div>

						</form>

						<div style={[styles.imageCropperWrapper, this.state.userImageFile !== null && styles.imageCropperWrapperVisible]} >
							<div style={styles.imageCropper}>
								<ImageCropper height={500} width={500} image={this.state.userImageFile} onCancel={this.cancelImageUpload} onUpload={this.userImageUploaded} />
							</div>
						</div>

					</div>
				}

			</div>
		);
	}
});

function mapStateToProps(state) {
	return {
		accountData: state.account.toJS(),
	};
}

export default connect(mapStateToProps)(Radium(CreateAccount));

styles = {
	container: {
		width: '500px',
		padding: '2em 1em',
		margin: '0 auto',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: 'auto',
		}
	},
	input: {
		width: 'calc(100% - 20px - 4px)',
	},
	loaderContainer: {
		display: 'inline-block',
		position: 'relative',
		top: 15,
	},
	bio: {
		height: '4em',
	},

	userImage: {
		width: '100px',
	},
	errorMessage: {
		padding: '10px 0px',
		color: globalStyles.errorRed,
	},
	registerLink: {
		...globalStyles.link,
		display: 'block',
		margin: '3em 0em'
	},
	prefixedInputWrapper: {
		display: 'table',
		width: '100%',
		marginBottom: '1.2em',
	},
	prefix: {
		display: 'table-cell',
		backgroundColor: '#F3F3F4',
		verticalAlign: 'middle',
		textAlign: 'center',
		padding: '4px 10px',
		borderWidth: '2px 0px 2px 2px',
		borderStyle: 'solid',
		borderColor: '#BBBDC0',
		borderRadius: '1px 0px 0px 1px',
		width: '1%',
		fontSize: '0.9em',
		whiteSpace: 'nowrap',
	},
	prefixedInput: {
		display: 'table-cell',
		marginBottom: 0,
		borderRadius: '0px 1px 1px 0px',
	},
	imageCropperWrapper: {
		height: '100vh',
		width: '100vw',
		backgroundColor: 'rgba(255,255,255,0.75)',
		position: 'fixed',
		top: 0,
		left: 0,
		opacity: 0,
		pointerEvents: 'none',
		transition: '.1s linear opacity',
		display: 'flex',
		justifyContent: 'center',
	},
	imageCropperWrapperVisible: {
		opacity: 1,
		pointerEvents: 'auto',
	},
	imageCropper: {
		height: '270px',
		width: '450px',
		alignSelf: 'center',
		backgroundColor: 'white',
		boxShadow: '0px 0px 10px #808284',
		'@media screen and (min-resolution: 3dppx), screen and (max-width: 767px)': {
			width: '100%',
			height: 'auto',
			left: 0,
		},
	},
	
};
