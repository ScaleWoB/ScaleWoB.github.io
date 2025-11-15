import { useParams } from 'react-router-dom';
import { useEnvironmentData } from '../services/environmentService';
import EnvironmentLauncher from './EnvironmentLauncher';
import EnvironmentPlaceholder from './EnvironmentPlaceholder';

const EnvironmentWrapper = () => {
  const { envId } = useParams<{ envId: string }>();
  const { data: environmentData } = useEnvironmentData();

  // Check if the requested environment exists in the loaded data
  const environmentExists = environmentData?.environments?.some(
    env => env.id === envId
  );

  // If environment exists, show launcher, otherwise show placeholder
  if (environmentExists) {
    return <EnvironmentLauncher />;
  }

  return <EnvironmentPlaceholder />;
};

export default EnvironmentWrapper;
