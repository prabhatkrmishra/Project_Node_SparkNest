import { getProfileArticlePreviews } from "../../../api/ARTICLESAPI";

import RenderPreviews from "../RenderPreviews";

const ShowLiked = (prop) => {
  const url = getProfileArticlePreviews(prop.uid);
  const type = 102;

  return (
    <>
      <RenderPreviews url={url} type={type}/>
    </>
  );
};

export default ShowLiked;
