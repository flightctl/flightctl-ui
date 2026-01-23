import * as React from 'react';
import { ImageBuild } from '@flightctl/types/imagebuilder';
import { useAppContext } from '../../../hooks/useAppContext';
import { useFetch } from '../../../hooks/useFetch';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { toImageBuildWithExports } from './utils';

export const useEditImageBuild = (): [string | undefined, ImageBuildWithExports | undefined, boolean, unknown] => {
  const {
    router: { useParams },
  } = useAppContext();
  const { imageBuildId } = useParams<{ imageBuildId: string }>();

  const { get } = useFetch();
  const [imageBuild, setImageBuild] = React.useState<ImageBuildWithExports>();
  const [isLoading, setIsLoading] = React.useState<boolean>(!!imageBuildId);
  const [error, setError] = React.useState<unknown>();

  React.useEffect(() => {
    const fetch = async () => {
      try {
        const imageBuild = await get<ImageBuild>(`imagebuilds/${imageBuildId}?withExports=true`);
        setImageBuild(toImageBuildWithExports(imageBuild));
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageBuildId && !imageBuild) {
      fetch();
    }
  }, [imageBuildId, get, imageBuild]);

  return [imageBuildId, imageBuild, isLoading, error];
};
