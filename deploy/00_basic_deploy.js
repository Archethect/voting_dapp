module.exports =
    async ({ getNamedAccounts,deployments}) => {
        const {deploy} = deployments;
        const {deployer} = await getNamedAccounts();

        // the following will only deploy "Election" if the contract was never deployed or if the code changed since last deployment
        await deploy('Election', {
            from: deployer,
            proxy: {
                //Workaround to create a proxy with same arguments in constructor as default supported proxies by hardhat-deploy.
                //Change when hardhat deploy has UUPS support (ERC1967Proxy).
                proxyContract: "MyProxy",
                execute: {
                    init: {
                        methodName: "initialize",
                        args: []
                    }
                }
            },
            args: [],
            log: true
        });
};
module.exports.tags = ['Election'];