import Save from "./Save";
import Like from "./Like";

// eslint-disable-next-line react/prop-types
const Main = ({ articleId }) => {
  return (
    <div className="save-like">
      <Save articleId={articleId}/>
      <Like articleId={articleId}/>
    </div>
  );
};

export default Main;
