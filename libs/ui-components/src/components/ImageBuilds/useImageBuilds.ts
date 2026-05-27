import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { ImageBuild, ImageBuildList, ImagePromotion, ImagePromotionList } from '@flightctl/types/imagebuilder';
import { ImageBuildWithExports } from '../../types/extraTypes';
import { useAppContext } from '../../hooks/useAppContext';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';
import { toImageBuildWithExports } from './CreateImageBuildWizard/utils';
import { getLatestPromotion } from './NewVersionImageBuildWizard/utils';

export enum ImageBuildsSearchParams {
  Name = 'name',
}

type ImageBuildsEndpointArgs = {
  name?: string;
  nextContinue?: string;
};

export const useImageBuildsBackendFilters = () => {
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsRef = React.useRef(searchParams);
  const name = searchParams.get(ImageBuildsSearchParams.Name) || undefined;

  const setName = React.useCallback(
    (nameVal: string) => {
      const newParams = new URLSearchParams({
        [ImageBuildsSearchParams.Name]: nameVal,
      });
      paramsRef.current = newParams;
      setSearchParams(newParams);
    },
    [setSearchParams],
  );

  const hasFiltersEnabled = !!name;

  return {
    name,
    setName,
    hasFiltersEnabled,
  };
};

const getImageBuildsEndpoint = ({ name, nextContinue }: { name?: string; nextContinue?: string }) => {
  const params = new URLSearchParams({
    limit: `${PAGE_SIZE}`,
    withExports: 'true',
  });
  if (name) {
    params.set('fieldSelector', `metadata.name contains ${name}`);
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
  }
  return `imagebuilds?${params.toString()}`;
};

const useImageBuildsEndpoint = (args: ImageBuildsEndpointArgs): [string, boolean] => {
  const endpoint = getImageBuildsEndpoint(args);
  const [ibEndpointDebounced] = useDebounce(endpoint, 1000);
  return [ibEndpointDebounced, endpoint !== ibEndpointDebounced];
};

export type ImageBuildsLoadBase = {
  isLoading: boolean;
  error: unknown;
  isUpdating: boolean;
  refetch: VoidFunction;
};

export type ImageBuildsLoad = ImageBuildsLoadBase & {
  imageBuilds: ImageBuildWithExports[];
  pagination: PaginationDetails<ImageBuildList>;
};

export type ImageBuildLoad = ImageBuildsLoadBase & {
  imageBuild: ImageBuildWithExports;
};

export const useImageBuilds = (args: ImageBuildsEndpointArgs): ImageBuildsLoad => {
  const pagination = useTablePagination<ImageBuildList>();
  const [imageBuildsEndpoint, imageBuildsDebouncing] = useImageBuildsEndpoint({
    ...args,
    nextContinue: pagination.nextContinue,
  });
  const [imageBuildsList, isLoading, error, refetch, updating] = useFetchPeriodically<ImageBuildList>(
    {
      endpoint: imageBuildsEndpoint,
    },
    pagination.onPageFetched,
  );

  return {
    imageBuilds: (imageBuildsList?.items || []).map(toImageBuildWithExports),
    isLoading,
    error,
    isUpdating: updating || imageBuildsDebouncing,
    refetch,
    pagination,
  };
};

const getImageBuildPromotionsEndpoint = (buildNames: string[]): string => {
  if (buildNames.length === 0) {
    return '';
  }
  const fieldSelector =
    buildNames.length === 1
      ? `spec.source.imageBuildRef=${buildNames[0]}`
      : `spec.source.imageBuildRef in (${buildNames.join(',')})`;
  const params = new URLSearchParams({ fieldSelector });
  return `imagepromotions?${params.toString()}`;
};

export const useImageBuildLatestPromotions = (buildNames: string[]): [Record<string, ImagePromotion>, VoidFunction] => {
  const endpoint = getImageBuildPromotionsEndpoint(buildNames);
  const [promotionsList, , , refetch] = useFetchPeriodically<ImagePromotionList>({ endpoint });

  return React.useMemo(() => {
    if (!promotionsList?.items.length) {
      return [{}, refetch];
    }
    return [
      promotionsList.items.reduce<Record<string, ImagePromotion>>((acc, promotion) => {
        const buildRef = promotion.spec.source.imageBuildRef;
        acc[buildRef] = acc[buildRef] ? (getLatestPromotion([acc[buildRef], promotion]) as ImagePromotion) : promotion;
        return acc;
      }, {}),
      refetch,
    ];
  }, [promotionsList, refetch]);
};

export const useImageBuild = (
  imageBuildId: string,
): [ImageBuildWithExports | undefined, boolean, unknown, VoidFunction] => {
  const [imageBuild, isLoading, error, refetch] = useFetchPeriodically<ImageBuild>({
    endpoint: `imagebuilds/${imageBuildId}?withExports=true`,
  });

  return [imageBuild ? toImageBuildWithExports(imageBuild) : undefined, isLoading, error, refetch];
};
