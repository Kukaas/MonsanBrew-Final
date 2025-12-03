import Address from '../models/address.model.js';

// Create new address
export const createAddress = async (req, res) => {
    try {
        const {
            label,
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            latitude,
            longitude,
            isDefault
        } = req.body;

        // Validate required fields
        if (!contactNumber || !lotNo || !barangay || !municipality || !province || !latitude || !longitude) {
            return res.status(400).json({ message: 'Missing required address fields' });
        }

        // If this is set as default, unset other default addresses
        if (isDefault) {
            await Address.updateMany(
                { userId: req.user._id, isDefault: true },
                { isDefault: false }
            );
        }

        // Check if user has no addresses, make this one default
        const existingAddresses = await Address.countDocuments({ userId: req.user._id });
        const shouldBeDefault = existingAddresses === 0 || isDefault;

        const address = new Address({
            userId: req.user._id,
            label: label || 'Home',
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            latitude,
            longitude,
            isDefault: shouldBeDefault
        });

        await address.save();

        res.status(201).json({
            message: 'Address created successfully',
            address
        });
    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({ message: 'Failed to create address' });
    }
};

// Get all addresses for current user
export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id })
            .sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({ addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
};

// Get default address for current user
export const getDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findOne({
            userId: req.user._id,
            isDefault: true
        });

        if (!address) {
            return res.status(404).json({ message: 'No default address found' });
        }

        res.status(200).json({ address });
    } catch (error) {
        console.error('Get default address error:', error);
        res.status(500).json({ message: 'Failed to fetch default address' });
    }
};

// Get address by ID
export const getAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ address });
    } catch (error) {
        console.error('Get address by ID error:', error);
        res.status(500).json({ message: 'Failed to fetch address' });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            label,
            contactNumber,
            lotNo,
            purok,
            street,
            landmark,
            barangay,
            municipality,
            province,
            latitude,
            longitude
        } = req.body;

        const address = await Address.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Update fields
        if (label !== undefined) address.label = label;
        if (contactNumber !== undefined) address.contactNumber = contactNumber;
        if (lotNo !== undefined) address.lotNo = lotNo;
        if (purok !== undefined) address.purok = purok;
        if (street !== undefined) address.street = street;
        if (landmark !== undefined) address.landmark = landmark;
        if (barangay !== undefined) address.barangay = barangay;
        if (municipality !== undefined) address.municipality = municipality;
        if (province !== undefined) address.province = province;
        if (latitude !== undefined) address.latitude = latitude;
        if (longitude !== undefined) address.longitude = longitude;

        await address.save();

        res.status(200).json({
            message: 'Address updated successfully',
            address
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ message: 'Failed to update address' });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Check if this is the only address
        const addressCount = await Address.countDocuments({ userId: req.user._id });
        if (addressCount === 1) {
            return res.status(400).json({ message: 'Cannot delete your only address' });
        }

        // If deleting default address, set another one as default
        if (address.isDefault) {
            const newDefault = await Address.findOne({
                userId: req.user._id,
                _id: { $ne: id }
            }).sort({ createdAt: -1 });

            if (newDefault) {
                newDefault.isDefault = true;
                await newDefault.save();
            }
        }

        await Address.findByIdAndDelete(id);

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ message: 'Failed to delete address' });
    }
};

// Set address as default
export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Unset all other default addresses
        await Address.updateMany(
            { userId: req.user._id, isDefault: true },
            { isDefault: false }
        );

        // Set this address as default
        address.isDefault = true;
        await address.save();

        res.status(200).json({
            message: 'Default address updated successfully',
            address
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ message: 'Failed to set default address' });
    }
};
