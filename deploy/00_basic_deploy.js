module.exports =
    async ({ getNamedAccounts,deployments}) => {
        const {deploy} = deployments;
        const {deployer} = await getNamedAccounts();

        // the following will only deploy "Election" if the contract was never deployed or if the code changed since last deployment
        await deploy('Election', {
            from: deployer,
            args: [],
            log: true
        });
};