import handleResponse from "../../config/http-response.js"
import Plans from "../../src/models/planModal.js"


class PlanController {
    //get all plan
    static GetAllPlans = async (req, resp) => {
        try {
            const plan = await Plans.find({ status: true, deleted_at: null })
            const base_url = `${req.protocol}://${req.get("host")}`;

            if (!plan) {
                return handleResponse(200, "No Plan Found", {}, resp)
            }
            for (const key of plan) {
                if (key && key?.featured_image) {
                    key.featured_image = `${base_url}/${key.featured_image}`
                }

                if (key && key?.gallery_image) {
                    key.gallery_image = key.gallery_image.map(image => `${base_url}/${image}`)
                }
            }
            return handleResponse(200, "All Plans", plan, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

    //get single plan
    static GetSinglePlan = async (req, resp) => {
        try {
            const { id } = req.params;
            const plan = await Plans.findOne({ id: id, status: true, deleted_at: null })
            const base_url = `${req.protocol}://${req.get("host")}`;
            if (!plan) {
                return handleResponse(404, "Plan Not Found", {}, resp)
            }
            if (plan && plan?.featured_image) {
                plan.featured_image = `${base_url}/${plan.featured_image}`
            }
            if (plan && plan?.gallery_image) {
                plan.gallery_image = plan.gallery_image.map(image => `${base_url}/${image}`)
            }
            return handleResponse(200, "Single Plan", plan, resp)
        } catch (err) {
            return handleResponse(500, err.message, {}, resp)
        }
    }

}

export default PlanController