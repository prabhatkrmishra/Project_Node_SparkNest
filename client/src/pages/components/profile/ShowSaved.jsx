import { getProfileArticlePreviews } from "../../../api/ARTICLESAPI";

import RenderPreviews from "../RenderPreviews";

const ShowSaved = (prop) => {
  const url = getProfileArticlePreviews(prop.uid);
  const type = 103;

  return (
    <>
      <RenderPreviews url={url} type={type}/>
    </>
  );
};

export default ShowSaved;
