import * as React from "react";
import './LoginForm.css';

type FormProps = {
  submitCallback: (data: FormState) => void
  fields: {
    type: ('submit' | 'button' | 'text' | 'password' | 'textArea'),
    name: string,
    label: string,
    initValue?: string,
    autoComplete?: boolean
  }[],
  submitText?: string,
  vertical?: boolean
}
type FormState = {
  [name: string]: string
};

export class LoginForm extends React.Component<FormProps, FormState> {
  mounted = false;

  constructor(props: FormProps) {
    super(props);
    let s: { [key: string]: string } = {};
    this.props.fields.forEach(o => {
      s[o.name] = o.initValue ? o.initValue : ''
    });
    this.state = s;
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    });
  };

  private submitCallback(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
    this.props.submitCallback(this.state);
  };

  render() {
    let formContent = this.props.fields.map((o, i) => {
      return (
        <label style={{}} key={i}>
          <span className={'LoginForm-span'}>{o.label}</span>
          {o.type === 'textArea' ?
            <textarea className={'LoginForm-input'}
                      style={{display: this.props.vertical ? 'block' : 'default'}}
                      tabIndex={0}
                      name={o.name}
                      value={this.state[o.name]}
                      onChange={this.handleInputChange}
            /> :
            <input className={'LoginForm-input'}
                   style={{display: this.props.vertical ? 'block' : 'default'}}
                   tabIndex={0}
                   autoComplete={o.autoComplete === false ? 'off' : 'on'}
                   name={o.name}
                   type={o.type}
                   value={this.state[o.name]}
                   onChange={this.handleInputChange}
            />}
        </label>
      );
    });
    formContent.push(<input tabIndex={0} className={'LoginForm-input LoginForm-submit'} key={this.props.fields.length}
                            type={'submit'}
                            style={{display: this.props.vertical ? 'block' : 'default'}}
                            value={this.props.submitText ? this.props.submitText : 'Submit'}
                            onClick={(e) => {
                              this.submitCallback(e)
                            }}/>);
    return (
      <form style={{display: "block"}} className={'LoginForm-form'}>
        {formContent}
      </form>
    )
  }
}

export default LoginForm;
