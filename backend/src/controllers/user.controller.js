import User from '../models/user.model.js';

// Get current user's address
export const getAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('contactNumber lotNo purok street landmark barangay municipality province');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ address: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch address' });
    }
};

// Update current user's address
export const updateAddress = async (req, res) => {
    try {
        const { contactNumber, lotNo, purok, street, landmark, barangay, municipality, province } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { contactNumber, lotNo, purok, street, landmark, barangay, municipality, province },
            { new: true, runValidators: true, fields: 'contactNumber lotNo purok street landmark barangay municipality province' }
        );
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ address: user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update address' });
    }
};
