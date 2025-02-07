import { RolloutPolicyForm } from '../../../Fleet/CreateFleet/types';
import { useTranslation } from '../../../../hooks/useTranslation';

const ReviewUpdatePolicy = ({ rolloutPolicy }: { rolloutPolicy: RolloutPolicyForm }) => {
  const { t } = useTranslation();
  if (!rolloutPolicy.isActive) {
    return '-';
  }

  return t('{{ count }} batches have been defined', { count: rolloutPolicy.batches.length });
};

export default ReviewUpdatePolicy;
