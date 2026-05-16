import { useWPAjax } from '../../../react-utils/hooks';

const usePremium = (nonce) => {
	const { data = null, isLoading } = useWPAjax('etfPipeChecker', { _wpnonce: nonce });
	const isPremium = (!isLoading && data?.isPipe) || false;

	return { isPremium, isLoading };
};
export default usePremium;