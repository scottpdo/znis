import styled from "styled-components";

const Wrapper = styled.div`
  background: black;
  color: white;
  height: 100vh;
  padding: 20px;
  width: 100vw;
`;

const Input = styled.input`
  appearance: none;
  background: transparent;
  color: white;
  border: none;

  &:focus {
    border-bottom: 1px solid white;
    outline: 0;
  }
`;

export default class Index extends React.Component {
  inputRef = React.createRef();

  constructor() {
    super();
    this.state = {
      actions: []
    };
  }

  submit = e => {
    e.preventDefault();
    const { value } = this.inputRef.current;
    this.setState(
      {
        actions: this.state.actions.concat(value)
      },
      () => {
        this.inputRef.current.value = "";
      }
    );
  };

  render() {
    const { actions } = this.state;
    return (
      <Wrapper>
        {actions.length > 0 && (
          <pre style={{ margin: 0 }}>{actions.map(a => a + "\n")}</pre>
        )}
        <form onSubmit={this.submit}>
          <Input ref={this.inputRef} placeholder="test type" />
        </form>
      </Wrapper>
    );
  }
}
