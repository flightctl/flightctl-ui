import * as React from 'react';
import { ImagePromotion, ImagePromotionList } from '@flightctl/types/imagebuilder';

import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { RESOURCE, VERB } from '../../types/rbac';
import { usePermissionsContext } from '../common/PermissionsContext';
import { useAppContext } from '../../hooks/useAppContext';

const promotionPermissions = [{ kind: RESOURCE.IMAGE_PROMOTION, verb: VERB.LIST }];

const useImagePromotions = (imageBuildName: string, pagination: PaginationDetails<ImagePromotionList>) => {
  const { checkPermissions } = usePermissionsContext();
  const [canListPromotions] = checkPermissions(promotionPermissions);
  const imagePromotionsEndpoint = React.useMemo(() => {
    const params = new URLSearchParams();
    params.set('fieldSelector', `spec.source.imageBuildRef=${imageBuildName}`);
    params.set('limit', `${PAGE_SIZE}`);
    if (pagination.nextContinue) {
      params.set('continue', pagination.nextContinue);
    }
    return `imagepromotions?${params.toString()}`;
  }, [imageBuildName, pagination.nextContinue]);
  return useFetchPeriodically<ImagePromotionList>(
    {
      endpoint: canListPromotions ? imagePromotionsEndpoint : '',
    },
    pagination.onPageFetched,
  );
};

export type ImagePromotionsContextType = {
  imagePromotions: ImagePromotion[];
  isLoading: boolean;
  error: unknown;
  refetchPromotions: VoidFunction;
  isUpdating: boolean;
  pagination: PaginationDetails<ImagePromotionList>;
};

const ImagePromotionsContext = React.createContext<ImagePromotionsContextType | undefined>(undefined);

export const ImagePromotionsContextProvider = ({ children }: React.PropsWithChildren) => {
  const {
    router: { useParams },
  } = useAppContext();
  const { imageBuildId } = useParams() as { imageBuildId: string };
  const pagination = useTablePagination<ImagePromotionList>();
  const [imagePromotions, isLoading, error, refetchPromotions, isUpdating] = useImagePromotions(
    imageBuildId,
    pagination,
  );

  const context = React.useMemo(
    () => ({
      imagePromotions: imagePromotions?.items || [],
      isLoading,
      error,
      refetchPromotions,
      pagination,
      isUpdating,
    }),
    [imagePromotions, isLoading, error, refetchPromotions, pagination, isUpdating],
  );

  return <ImagePromotionsContext.Provider value={context}>{children}</ImagePromotionsContext.Provider>;
};

export const useImagePromotionsContext = (): ImagePromotionsContextType => {
  const context = React.useContext(ImagePromotionsContext);
  if (context === undefined) {
    throw new Error('useImagePromotionsContext must be used within an ImagePromotionsContextProvider');
  }
  return context;
};
